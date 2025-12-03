FROM ruby:2.7.5

WORKDIR /app
EXPOSE 4455

RUN gem install bundler -v 1.17.3
ADD Gemfile Gemfile.lock /app/
RUN bundle

RUN apt update && apt install nodejs -y
ADD . /app

ENTRYPOINT ["bundle", "exec", "middleman", "server", "-p", "4455"]
