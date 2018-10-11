import json
import operator

from django.db import models, transaction
from django.db.models import Count
from django.contrib.auth.models import User


class DatasetManager(models.Manager):
    @transaction.atomic
    def create_from_list(self, name, data, display_columns=None, num_user_labels=None):
        # Work out what feature columns are used from the first 1000 datapoints (rows)
        columns = {}
        for row in data[:1000]:
            for k, v in row.items():
                if not k in columns:
                    columns[k] = True
        columns = json.dumps(sorted(list(columns.keys())), sort_keys=True)

        if not display_columns:
            display_columns = columns
        if not num_user_labels:
            num_user_labels = 3

        # Create the Dataset object
        ds = self.create(name=name, columns=columns, display_columns=display_columns, num_user_labels=num_user_labels)

        # Add a Datapoint for each row
        for i, row in enumerate(data):
            Datapoint(dataset=ds, index=i, data=json.dumps(row, sort_keys=True)).save()

        return ds


class Dataset(models.Model):
    name            = models.CharField(max_length=200)
    columns         = models.TextField()
    display_columns = models.TextField()
    num_user_labels = models.IntegerField()
    objects         = DatasetManager()

    def __str__(self):
        return self.name

    def labelling_complete(self):
        num_final_user_labels = self.datapoints.count() * self.num_user_labels
        num_user_labels = UserLabel.objects.filter(label__dataset=self).count()
        return num_user_labels / num_final_user_labels


class Datapoint(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete='CASCADE', related_name='datapoints')
    index   = models.IntegerField()
    data    = models.TextField()

    def __str__(self):
        return '{}: {}: {}'.format(self.dataset.name, self.index, self.data)

    def label_scores(self):
        scores = {label.name: 0 for label in self.dataset.labels.all()}
        for k, v in scores.items():
            scores[k] = self.user_labels.filter(label__name=k).count()
        return scores

    def label_determined(self):
        if self.user_labels.count() < self.dataset.num_user_labels:
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


class Label(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete='CASCADE', related_name='labels')
    name    = models.CharField(max_length=200)

    unique_together = (('dataset', 'name'),)

    def __str__(self):
        return '{}: {}'.format(self.dataset.name, self.name)


class UserLabel(models.Model):
    user        = models.ForeignKey(User, on_delete='CASCADE')
    datapoint   = models.ForeignKey(Datapoint, on_delete='CASCADE', related_name='user_labels')
    label       = models.ForeignKey(Label, on_delete='CASCADE')

    def __str__(self):
        return '{}: {}: {}'.format(self.user.username, self.label, self.datapoint)