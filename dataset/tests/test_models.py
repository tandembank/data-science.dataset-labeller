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

    # Datapoints should have been added for the dataset through the create_from_list() call
    assert ds.datapoints.count() == 3
    assert json.loads(ds.datapoints.all()[0].data)['color'] == 'green'
    assert ds.labelling_complete() == 0

    # Labels should have been created
    labels = Label.objects.filter(dataset=ds)
    assert labels.count() == 2
    assert labels.get(name='apple').name == 'apple'


@pytest.mark.django_db()
def test_user_label_percent(fruit_dataset, django_user_model):
    ds = fruit_dataset()
    user1 = django_user_model.objects.create(username='user1', password='secret')
    label_apple = Label.objects.get(dataset=ds, name='apple')
    label_orange = Label.objects.get(dataset=ds, name='orange')
    datapoints = Datapoint.objects.all()

    # Adding user labels should increase the labelling_complete() of the dataset
    UserLabel.objects.create(user=user1, datapoint=datapoints[0], label=label_apple).save()
    assert ds.labelling_complete() == 0.1111111111111111
    UserLabel.objects.create(user=user1, datapoint=datapoints[1], label=label_orange).save()
    UserLabel.objects.create(user=user1, datapoint=datapoints[2], label=label_apple).save()
    assert ds.labelling_complete() == 0.3333333333333333


@pytest.mark.django_db()
def test_user_label_datapoints(fruit_dataset, django_user_model):
    ds = fruit_dataset()
    ds.num_labellings_required = 2
    ds.save()
    user1 = django_user_model.objects.create(username='user1', password='secret')
    user2 = django_user_model.objects.create(username='user2', password='secret')
    user3 = django_user_model.objects.create(username='user3', password='secret')
    label_apple = Label.objects.get(dataset=ds, name='apple')
    label_orange = Label.objects.get(dataset=ds, name='orange')

    # user1 creates labels for all 3 datapoints in the set and end up with an empty set
    datapoints = ds.datapoints_for_user(user1)
    assert datapoints.count() == 3
    UserLabel.objects.create(user=user1, datapoint=datapoints[0], label=label_apple)
    datapoints = ds.datapoints_for_user(user1)
    assert datapoints.count() == 2
    UserLabel.objects.create(user=user1, datapoint=datapoints[0], label=label_apple)
    datapoints = ds.datapoints_for_user(user1)
    assert datapoints.count() == 1
    UserLabel.objects.create(user=user1, datapoint=datapoints[0], label=label_apple)
    datapoints = ds.datapoints_for_user(user1)
    assert datapoints.count() == 0
    # user2 has available tasks though
    datapoints = ds.datapoints_for_user(user2)
    assert datapoints.count() == 3
    # There are only 2 num_labellings_required so users 2 & 3 are competing now
    UserLabel.objects.create(user=user2, datapoint=datapoints[0], label=label_apple)
    datapoints = ds.datapoints_for_user(user3)
    assert datapoints.count() == 2
    UserLabel.objects.create(user=user3, datapoint=datapoints[0], label=label_apple)
    datapoints = ds.datapoints_for_user(user2)
    assert datapoints.count() == 1


@pytest.mark.django_db()
def test_label_scores(fruit_dataset, django_user_model):
    ds = fruit_dataset()
    user1 = django_user_model.objects.create(username='user1', password='secret')
    user2 = django_user_model.objects.create(username='user2', password='secret')
    user3 = django_user_model.objects.create(username='user3', password='secret')
    user4 = django_user_model.objects.create(username='user4', password='secret')
    label_apple = Label.objects.get(dataset=ds, name='apple')
    label_orange = Label.objects.get(dataset=ds, name='orange')
    datapoint = Datapoint.objects.all()[0]

    # Not enough user labels
    UserLabel.objects.create(user=user1, datapoint=datapoint, label=label_apple).save()
    assert datapoint.label_scores() == {'apple': 1, 'orange': 0}
    assert datapoint.label_determined() == None
    UserLabel.objects.create(user=user2, datapoint=datapoint, label=label_orange).save()
    assert datapoint.label_scores() == {'apple': 1, 'orange': 1}
    assert datapoint.label_determined() == None

    # Minimum user labels met and output determined
    UserLabel.objects.create(user=user3, datapoint=datapoint, label=label_apple).save()
    assert datapoint.label_scores() == {'apple': 2, 'orange': 1}
    assert datapoint.label_determined() == 'apple'

    # Even split of user labels means one cannot be determined
    UserLabel.objects.create(user=user4, datapoint=datapoint, label=label_orange).save()
    assert datapoint.label_scores() == {'apple': 2, 'orange': 2}
    assert datapoint.label_determined() == None
