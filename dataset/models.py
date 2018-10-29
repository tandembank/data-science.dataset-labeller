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

    def labelling_complete(self):
        num_final_user_labels = self.datapoints.count() * self.num_labellings_required
        num_labellings_required = UserLabel.objects.filter(label__dataset=self).count()
        return num_labellings_required / num_final_user_labels

    def datapoints_for_user(self, user):
        # Gets the remaining Datapoints that are available to be labelled by a user (excluding ones the user has already labelled or have enough labels to cover num_labellings_required)
        datapoints = self.datapoints \
            .exclude(user_labels__user=user) \
            .annotate(count=Count('user_labels')) \
            .filter(count__lt=self.num_labellings_required)
        return datapoints


class Datapoint(UUIDModel, VersionedModel):
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


class Label(UUIDModel, VersionedModel):
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
    user        = models.ForeignKey(User, on_delete='CASCADE')
    datapoint   = models.ForeignKey(Datapoint, on_delete='CASCADE', related_name='user_labels')
    label       = models.ForeignKey(Label, on_delete='CASCADE')

    def __str__(self):
        return '{}: {}: {}'.format(self.user.username, self.label, self.datapoint)
