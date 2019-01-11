[SimpleVote](http://simplevote.tk) &mdash; An open-source, live updating, voting platform.
==========
![](http://img.shields.io/version/1.1.0.png?color=green)
[![Build Status](https://travis-ci.org/dessalines/simple-vote.svg?branch=master)](https://travis-ci.org/dessalines/simple-vote)

<!---

-->

[SimpleVote](http://simplevote.tk) is an open-source, self-hostable, **live-updating** voting/polling platform, for both live meetings, or extended polls. 

Polls can be dynamic, meaning users can(*if allowed*) contribute options and questions themselves.

It uses [range voting](http://rangevoting.org/UniqBest.html) (also known as olympic score voting) for all your poll options. [Range voting](http://rangevoting.org/) is *more expressive* than simple :thumbsup: or :thumbsdown: votes (IE [approval](http://rangevoting.org/AppExec.html)). It also beats out [IRV](http://rangevoting.org/rangeVirv.html), and [first past the post](http://rangevoting.org/Plurality.html) for [minimizing voter regret](http://rangevoting.org/UniqBest.html).

Features:

- Polls can have multiple questions.
- Anyone can edit, delete, or create additional questions, and options (if allowed by the creator), at anytime.
- Live chat on the sidebar. 
- Questions can have expiration times, and thresholds (Making sure options with too few votes don't win). 
- Easily shareable poll links.
- Image and markdown support for all questions and candidates.
- Questions can hide voter names (anonymous voting).
- Questions can be either Range, or Pointing Poker style.

Tech used:

- [Java Spark](https://github.com/perwendel/spark), [Bootstrap v4](https://github.com/twbs/bootstrap), [Angular4](https://github.com/angular/angular), [Angular-cli](https://github.com/angular/angular-cli), [ng2-bootstrap](http://valor-software.com/ng2-bootstrap/), [ActiveJDBC](http://javalite.io/activejdbc), [Liquibase](http://www.liquibase.org/), [Postgres](https://www.postgresql.org/), [Markdown-it](https://github.com/markdown-it/markdown-it), [angular2-toaster](https://github.com/Stabzs/Angular2-Toaster)

Check out a sample poll [here](http://simplevote.tk/#/poll/jR).

[Change log](https://github.com/dessalines/simple-vote/issues/closed)

## Screenshots

![image](https://i.imgur.com/ZXPI8e1.png)

---

## Installation 

*If you want to self-host or help develop simplevote.*

### Docker

#### Requirements

- Docker
- docker-compose

#### Start the docker instance

```sh
git clone https://github.com/dessalines/simple-vote
cd simple-vote
// edit ARG ENDPOINT_NAME=http://localhost:4567 in ./Dockerfile to your hostname
docker-compose up
```

Goto to http://localhost:4567

### Local development

#### Requirements
- Java 8 + Maven
- Node + npm/yarn, [nvm](https://github.com/creationix/nvm) is the preferred installation method.
- angular-cli: `npm i -g @angular/cli@latest`
- Postgres 9.3 or higher

#### Download SimpleVote
`git clone https://github.com/dessalines/simple-vote`

#### Setup a postgres database
[Here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-16-04) are some instructions to get your DB up and running.

```sh
psql -c "create user simplevote with password 'asdf' superuser"
psql -c 'create database simplevote with owner simplevote;'
```

#### Open your pom.xml
```sh
cd simplevote
vim service/pom.xml
```

Edit it to point to your own database:
```xml
<!--The Database location and login, here's a sample-->
<jdbc.url>jdbc:postgresql://127.0.0.1/simplevote</jdbc.url>
<jdbc.username>simplevote</jdbc.username>
<jdbc.password>asdf</jdbc.password
```

#### Install SimpleVote

For local testing: 

`./install_dev.sh` and goto `http://localhost:4567/`

For a production environment, edit `ui/src/environments/environment.prod.ts` to point to your hostname, then run:

`./install_prod.sh`

You can redirect ports in linux to route from port 80 to this port:

`sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 4567`

---

## Bugs and feature requests
Have a bug or a feature request? If your issue isn't [already listed](https://github.com/dessalines/simple-vote/issues/), then open a [new issue here](https://github.com/dessalines/simple-vote/issues/new).


## TODO

- Set up travis-ci

