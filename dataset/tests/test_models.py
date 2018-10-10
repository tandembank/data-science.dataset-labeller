import json

import pytest

from dataset.models import Dataset, Datapoint, Label, UserLabel


FRUIT_LABELS = [
    'apple',
    'orange',
]

FRUIT_DATA = [
    {
        # Apple
        'shape':    'round',
        'color':    'green',
        'texture':  'smooth', 
    },
    {
        # Orange
        'shape':    'round',
        'color':    'orange',
        'texture':  'bobbly',
    },
    {
        # Apple
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
