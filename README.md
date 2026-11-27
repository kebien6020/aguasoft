# Aguasoft

Local development is intended as follows:

```sh
# On terminal 1
cd server
npm run dev
```


```sh
# On terminal 2
cd client
npm run dev
```

And separately:

* Open separate editor sessions for client and server
* Use [otel-desktop-viewer](https://github.com/CtrlSpice/otel-desktop-viewer) to observe telemetry

The intent is to run everything as local software, docker is no longer intended
as a development aid, only a production deployment mechanism.

Containers are built locally and pushed to a private registry as the release
mechanism, the CI builds are no longer intended to be actually used (pending to
be removed).
