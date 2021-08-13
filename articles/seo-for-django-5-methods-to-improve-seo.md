---
title: "SEO For Django: 5 Methods To Improve SEO"
description: Learn how to improve your Search engine optimisation for your Django website using this 5 easy methods
date: 2020-07-04
author: Maciej Janowski
image: https://cdn.buttercms.com/ouqGpalwQ02IAu4yAG7f
layout: article
tags: articles
---
This Week I decide to look into improving the SEO of my personal website. I don't know much about it, but after some research I found few things developers can do on their Django websites to improve your  SEO.

## What is SEO?
What is Search engine optimisation? It's a huge topic, but all you need to know as a web developer is that it's about making changes (optimising) to your website, to make it easier for search engines like Google to crawl, and index your content, which makes it easier for people to discover your content.

## Why Should You Learn It?
Developers should learn SEO so they can plan for it when developing for the web. If you don’t optimise your page, it will not show up in searches, so other people won’t know your site exists. Also it’s a great complementary skill for freelancing web developers, so they can offer their clients fuller service package.

Let’s look at few ways to improve SEO of our Django site.

## Slugs
Django provides a SlugField for its models. Slugs are short labels containing only letters, numbers, underscores or hyphens. We should create the URLs based on Slug fields. To create a canonical URL for the Post model, we use a Django convention to add a method for creating the URLs `get_absolute_url()`
```python
from django.db import models
from django.utils import timezone


class Post(models.Model):
    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=250, unique_for_date=‘publish’)
    publish = models.DateTimeField(default=timezone.now)	

    def get_absolute_url(self):
        return reverse(‘blog:post_detail’,
                            args=[self.publish.year,
                                    self.publish.month,
                                    self.publish.day, self.slug])
```

Here we create a Post model, and the canonical URL will be created based on the published date and the slug for example /2020/04/07/post-title/

## Meta Tags
Meta tags provide the search engines with information about your site, they should be placed within `<head>` tag in the HTML document.

**title**
When your page appears in the search results this, will be the first line/link.

Each page should have an unique title tag, and it should be short and descriptive.

Don't use generic titles, or the same title on multiple pages.
```html
<title>This is page Title</title>
```

**description**
This is the most important tag, it provides a description about the page of your website. Google will often use them as a preview snippet in the results of search.
The descriptions should be unique for each page, summarise what the page is about, and be 1-2 sentences short. Same as with title, don't make it generic or repeating over page.
```html
<meta name="description" property="og:description" content="This article looks at 6 methods developers can use to improve SEO of their Django Website">
```

**keywords**
This is a meta tag for keywords, it’s pretty self explanatory. Here we enter the keywords summarising our page.
```html
<meta name="keywords" content="seo, python, django, web development">
```

**author**
In this tag we specify the name of the author if it’s an article or something similar.
```html
<meta name="author" content="Maciej Janowski">
```

## Open Graph Meta Tags
Open Graph was created by Facebook to promote integration between Facebook and 3rd party website, by allowing pasted content to become “graph” objects. It gives control over how information travels from your page to 3rd party website. Other websites that recognize Open Graph meta tags are Twitter, LinkedIn, Google+. You can identify them by their property attribute begging with “og:”
```html
<meta property="og:url" content="https://janowski.dev/blog/2020/04/05/Intresting-article" />
<meta property="og:title" content="Intresting Article" />
<meta property="og:image" content="https://janowski.dev/static/cover.png" />
<meta property="og:image:alt" content="A green cover image with Django logo" />
```

## Twitter Tags
Another Type of Meta Tags are Twitter Tags.

They decide how will our link show up in twitter as a twitter card when we share it. We can test it [here](https://cards-dev.twitter.com/validator)
```html
<meta name="twitter:image" content="https//example.com/image.png" />
<meta property="twitter:image:alt" content="Description of the image" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@MaciejJanowski" />
```

## Sitemap
A sitemap is an XML file that tells search engines the pages of your website, their relevance, and how frequently they are updated. Using Sitemaps will make your site more visible in search engine ranking because sitemaps help crawlers to index your website's content.

Django comes with a sitemap framework, which allows us to generate sitemaps dynamically.  

To install the Sitemap framework open `settings.py` and add `django.contrib.sites` and `django.contrib.sitemaps` to the `INSTALLED_APPS` setting, and define a new ID for the site.
```python
SITE_ID = 1

INSTALLED_APPS = [
   ...
	'django.contrib.sites',
	'django.contrib.sitemaps',
]
```
Now create the tables for the site application
```python
python manage.py migrate
```
Inside the application of your site let's say "blog" create a new file called sitemaps.py

Assuming we have a model called Post inside our "blog" application
```python
from django.contrib.sitemaps import Sitemap

from .models import Post

class PostSitemap(Sitemap):
		changefreq = "weekly"
		priority = 0.9
		
		def items(self):
				return Post.objects.all()
		
		def lastmod(self, obj):
				return obj.updated
```
Finally go to the main urls.py of the project and add the sitemap, as follows
```python
from django.urls import path, include
from django.contrib.sitemaps.views import sitemap

from blog.sitemaps import PostSitemap

sitemaps = {
		"posts": PostSitemap,
}

urlpatterns = [
		path('blog/', include('blog.urls', namespace='blog')),
		path('sitemap.xml', sitemap, {'sitemaps': sitemaps},
						name='django.contrib.sitemaps.views.sitemap')
]
```
Now you can access the sitemap after opening `http://127.0.0.1:8000/sitemap.xml`

You should see output similar to this.
![sitemap preview](https://dev-to-uploads.s3.amazonaws.com/i/qmzj1ld601vkl0fyxvqh.png)
This only scratches the surface of SEO, there is much much more to it.

Check out the tools and resources below to learn more about SEO for Developers.

## Useful Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse/) - Tool from google for calculating score for SEO, Accessibility and few other key metrics.
- [Google Pagespeed Insights](https://developers.google.com/speed/pagespeed/insights/) - Another Google Tool, gives our site’s speed score or desktop and mobile.
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Twitter tool for validating and previewing the Twitter Card.

## Other Resources
- [Beginner Guide to SEO](https://moz.com/beginners-guide-to-seo)
- [Best SEO Practices for Developers](https://steelkiwi.com/blog/best-seo-practices-for-developers-put-your-skills-to-work/)
- [Try Except Pass Episode 10 - Studies in Search Engine Optimization And Why Developers Should Care](https://tryexceptpass.org/podcast/ep10-search-engine-optimization-for-developers/)
- [Try Except Pass Episode 11 - Studies in Search Engine Optimization: 13 Essential Practices for Developers](https://tryexceptpass.org/podcast/ep11-search-engine-optimization-essential-practices-for-developers/)