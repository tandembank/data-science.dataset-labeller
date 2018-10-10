import json

import pytest

from dataset.models import Dataset, Datapoint, Label, UserLabel


FRUIT_LABELS = [
    'apple',
    'orange',
]

FRUIT_DATA = [
    {
        # apple
        'shape':    'round',
        'color':    'green',
        'texture':  'smooth', 
    },
    {
        # orange
        'shape':    'round',
        'color':    'orange',
        'texture':  'bobbly',
    },
    {
        # apple
        'shape':    'round',
        'color':    'red',
        'texture':  'smooth',
    }
]


@pytest.fixture
def fruit_dataset():
    def create_fruit_dataset():
        ds = Dataset.objects.create_from_list('Fruit', FRUIT_DATA)
        for label in FRUIT_LABELS:
            Label.objects.create(dataset=ds, name=label)
        return ds
    return create_fruit_dataset


@pytest.mark.django_db()
def test_dataset_creation(fruit_dataset):
    ds = fruit_dataset()
    assert ds.datapoints.count() == 3
    assert json.loads(ds.datapoints.all()[0].data)['color'] == 'green'
    assert ds.labelling_complete() == 0

    labels = Label.objects.filter(dataset=ds)
    assert labels.count() == 2
    assert labels.get(name='apple').name == 'apple'


@pytest.mark.django_db()
def test_user_label(fruit_dataset, django_user_model):
    ds = fruit_dataset()
    user1 = django_user_model.objects.create(username="user1", password="secret")
    label_apple = Label.objects.get(dataset=ds, name='apple')
    label_orange = Label.objects.get(dataset=ds, name='orange')
    datapoints = Datapoint.objects.all()

    UserLabel.objects.create(user=user1, datapoint=datapoints[0], label=label_apple).save()
    assert ds.labelling_complete() == 0.1111111111111111
    UserLabel.objects.create(user=user1, datapoint=datapoints[1], label=label_orange).save()
    UserLabel.objects.create(user=user1, datapoint=datapoints[2], label=label_apple).save()
    assert ds.labelling_complete() == 0.3333333333333333