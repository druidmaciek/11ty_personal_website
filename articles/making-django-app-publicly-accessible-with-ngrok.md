---
title: Making Django App Publicly Accessible With Ngrok
description: Learn how to make Django App Publicly Accessible With Ngrok following this short article
date: 2020-06-28
author: Maciej Janowski
image: https://cdn.buttercms.com/EDWD7n4BSBWNEidgOBNf
layout: article
tags: articles
---
Sometimes when developing our Django application, we need to make it publicly accessible or use https, for example when testing OAuth authentication sometimes https is enforced, or when testing Shopify webhooks (where the request is executed on Shopify server, so we need to make it publicly available), or simply when we want to share it with a friend without deploying it live.

To achieve it We can use ngrok to redirect what you are running on localhost to publicly available ngrok URL. Let’s get started.

## Installing ngrok

on mac, we can install it simply with brew.

```bash
brew cask install ngrok
```
For windows we can download it from [here](https://ngrok.com/download).

## Running ngrok
o start ngrok we simply type “ngrok http [port]“, in our case we use port 8000, because it’s the default Django development server port.

```bash
ngrok http 8000
```
you will see the ngrok screen, and your ngrok URL, in my case it’s http://5cedabab7730.ngrok.io, you also have https connection available.

![ngrok running](https://dev-to-uploads.s3.amazonaws.com/i/imo5v2a5tpqh2abnb1gt.png)

Now go to settings.py and add 5cedabab7730.ngrok.io to ALLOWED_HOSTS. Run your Django development server.

```bash
python manage.py runserver
```

Now your Django App is available to the world under https://5cedabab7730.ngrok.io you can test external APIs, authentications, or share what you working on with your friends.