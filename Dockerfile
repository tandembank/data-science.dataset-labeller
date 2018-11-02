FROM ubuntu:18.04

RUN apt-get update && \
    apt-get install -y locales python3 python3-pip default-libmysqlclient-dev supervisor nginx-light curl apt-transport-https && \
    apt-get clean && \
        rm -rf /var/lib/apt/lists/* \
               /tmp/* \
               /var/tmp/*

RUN echo "en_GB.UTF-8 UTF-8" > /etc/locale.gen && locale-gen
ENV LANG en_GB.UTF-8
ENV LANGUAGE en_GB:en
ENV LC_ALL en_GB.UTF-8

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
        rm -rf /var/lib/apt/lists/* \
               /tmp/* \
               /var/tmp/*

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && \
    apt-get install -y yarn && \
    apt-get clean && \
        rm -rf /var/lib/apt/lists/* \
               /tmp/* \
               /var/tmp/*

WORKDIR /srv

COPY Pipfile /srv/Pipfile
RUN pip3 install pipenv
RUN pipenv run pip install pip==18.0
RUN pipenv install

COPY dataset /srv/dataset
COPY datasetlabeller /srv/datasetlabeller
COPY templates /srv/templates
COPY ui /srv/ui
COPY manage.py /srv/manage.py

COPY config/supervisord.conf /etc/supervisord.conf
COPY config/nginx.conf /etc/nginx/nginx.conf

WORKDIR /srv/ui
RUN yarn install
RUN yarn build
WORKDIR /srv

RUN pipenv run python manage.py collectstatic --noinput --link

CMD supervisord -c /etc/supervisord.conf

EXPOSE 80