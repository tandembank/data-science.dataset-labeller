# Dataset labeller

![](https://img.shields.io/travis/tandembank/data-science.dataset-labeller.svg) ![](https://img.shields.io/codecov/c/gh/tandembank/data-science.dataset-labeller.svg) ![](https://img.shields.io/github/license/tandembank/data-science.dataset-labeller.svg) ![](https://img.shields.io/github/last-commit/tandembank/data-science.dataset-labeller.svg)

This is a web-based tool we developed to label datasets quickly at [Tandem](https://tandem.co.uk). It is based on Python, Django, React and run through Docker Compose.

![Creating a new dataset and starting to label](https://epixstudios.co.uk/uploads/filer_public/7f/62/7f62f0ad-9cf3-47ba-9ad6-79282f456c7f/dataset_labeller_demo.gif)

This is the process for labelling a new dataset:
  1. Upload a CSV file containing rows that you want to label.
  2. Give it a name.
  3. Select the columns that should be displayed to a person labelling.
  2. Define the possible category labels and keyboard shortcuts to make things faster.
  3. Decide how many people need to label each row datapoint -- this is useful if you want to get a consensus.
  4. Save dataset.
  5. Get your team to login and label it.
  6. View job progress on the dashboard.
  7. Download the labelled dataset as a CSV -- it'll have an extra column with the labels

## Features

  * Import and export data in the format that you're comfortable with -- no need to pre-process data, just select the columns to display for labelling.
  * Each user has their own account so you can see who labelled what.
  * Labellers can access the tool remotely or within a corporate network using just their web browser.
  * Slick and quick user interface while you're labelling -- the next few datapoints are already loaded in your browsers so they're ready to show as soon as you've labelled the current one.
  * Multiple users can be labelling at once as we use locks to avoid collisions.
  * If some datapoints are tricky to label or your team are going at break-neck speed you can choose to get a consensus from an odd number of users, say 3 or 5.
  * Database included and configured in the Docker Compose file.
  * Cell content such as JSON lists gets displayed nicely formatted. We aim to extend this to identify other formats and image URLs.
