from datetime import timedelta
import json
import operator
import uuid

from django.contrib.auth.models import User
from django.db import models, transaction
from django.db.models import Count
from django.utils import timezone


class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class VersionedModel(models.Model):
    created_at = models.DateTimeField(blank=True)
    updated_at = models.DateTimeField(blank=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        now = timezone.now()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now
        super(VersionedModel, self).save()


class DatasetManager(models.Manager):
    @transaction.atomic
    def create_from_list(self, name, data, display_fields=None, num_labellings_required=None, created_by=None):
        # Work out what feature fields are used from the first 1000 datapoints (rows)
        fields = {}
        for row in data[:1000]:
            for k, v in row.items():
                if not k in fields:
                    fields[k] = True
        fields = json.dumps(sorted(list(fields.keys())), sort_keys=True)

        if not display_fields:
            display_fields = fields
        if not num_labellings_required:
            num_labellings_required = 3

        # Create the Dataset object
        ds = self.create(name=name, fields=fields, display_fields=display_fields, num_labellings_required=num_labellings_required, created_by=created_by)

        # Add a Datapoint for each row
        for i, row in enumerate(data):
            Datapoint(dataset=ds, index=i, data=json.dumps(row, sort_keys=True)).save()

        return ds


class Dataset(UUIDModel, VersionedModel):
    name                    = models.CharField(max_length=200, unique=True)
    fields                  = models.TextField()
    display_fields          = models.TextField()
    num_labellings_required = models.IntegerField()
    multiple_labels         = models.BooleanField(default=False)
    created_by              = models.ForeignKey(User, on_delete='PROTECT')
    objects                 = DatasetManager()

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.name

    @property
    def num_total_labellings_required(self):
        return self.datapoints.count() * self.num_labellings_required

    @property
    def num_labellings_completed(self):
        return UserLabel.objects.filter(label__dataset=self).count()

    @property
    def labelling_complete(self):
        return self.num_labellings_completed / self.num_total_labellings_required

    def datapoints_for_user(self, user, limit=3):
        # Remove any old locked Datapoints that Users might have claims and not completed
        UserDatapointClaim.objects.clear_expired()

        # Get (and return) Datapoints that were previously claimed by the User
        claimed_datapoints = list(self.datapoints.filter(user_claims__user=user)[:limit])
        if len(claimed_datapoints) >= limit:
            return claimed_datapoints

        # Gets the remaining Datapoints that are available to be labelled by a user (excluding ones the user has already labelled or have enough labels to cover num_labellings_required)
        limit_new = limit - len(claimed_datapoints)
        new_datapoints = self.datapoints \
            .filter(user_claims__isnull=True) \
            .exclude(user_labels__user=user) \
            .annotate(count=Count('user_labels')) \
            .filter(count__lt=self.num_labellings_required)[:limit_new]
        new_datapoints = list(new_datapoints[:limit_new])

        # Create locks on the User's claimed Datapoints
        for new_datapoint in new_datapoints:
            UserDatapointClaim.objects.get_or_create(user=user, datapoint=new_datapoint)

        return claimed_datapoints + new_datapoints


class Datapoint(UUIDModel, VersionedModel):
    # Represents a row of a Dataset and is presented for Labelling
    dataset = models.ForeignKey(Dataset, on_delete='CASCADE', related_name='datapoints')
    index   = models.IntegerField()
    data    = models.TextField()

    class Meta:
        ordering = ['index']

    def __str__(self):
        return '{}: {}: {}'.format(self.dataset.name, self.index, self.data)

    def label_scores(self):
        scores = {label.name: 0 for label in self.dataset.labels.all()}
        for k, v in scores.items():
            scores[k] = self.user_labels.filter(label__name=k).count()
        return scores

    def label_determined(self):
        if self.user_labels.count() < self.dataset.num_labellings_required:
            return None
        sorted_labels = sorted(self.label_scores().items(), key=operator.itemgetter(1), reverse=True)
        if not len(sorted_labels):
            return None
        determined, count = sorted_labels[0]
        try:
            if sorted_labels[1][1] == count:
                return None
        except IndexError:
            pass
        return determined

    @property
    def num_labellings_remaining(self):
        return self.dataset.num_labellings_required - self.user_labels.count()


class Label(UUIDModel, VersionedModel):
    # The possible Labels that can be used for a Dataset
    dataset     = models.ForeignKey(Dataset, on_delete='CASCADE', related_name='labels')
    name        = models.CharField(max_length=200)
    shortcut    = models.CharField(max_length=10)
    index       = models.PositiveSmallIntegerField(default=0)

    unique_together = (('dataset', 'name'), ('dataset', 'shortcut'))

    class Meta:
        ordering = ['index']

    def __str__(self):
        return '{}: {} ({})'.format(self.dataset.name, self.name, self.index)


class UserLabel(UUIDModel, VersionedModel):
    # Represents that a User has Labelled a Datapoint
    user        = models.ForeignKey(User, on_delete='CASCADE')
    datapoint   = models.ForeignKey(Datapoint, on_delete='CASCADE', related_name='user_labels')
    label       = models.ForeignKey(Label, on_delete='CASCADE')

    def __str__(self):
        return '{}: {}: {}'.format(self.user.username, self.label, self.datapoint)


class UserDatapointClaimManager(models.Manager):
    def clear_expired(self):
        self.filter(created_at__lt=timezone.now()-timedelta(seconds=3600)).delete()
        for claim in self.all():
            if UserLabel.objects.filter(datapoint=claim.datapoint, user=claim.user).count() > 0:
                claim.delete()


class UserDatapointClaim(UUIDModel, VersionedModel):
    # Prevents users trying to assign UserLabels to a Datapoint where there are more users working at a time than Dataset.num_labellings_required
    user        = models.ForeignKey(User, on_delete='CASCADE')
    datapoint   = models.ForeignKey(Datapoint, on_delete='CASCADE', related_name='user_claims')
    objects     = UserDatapointClaimManager()

    def __str__(self):
        return '{}: {}'.format(self.user.username, self.datapoint.id)
