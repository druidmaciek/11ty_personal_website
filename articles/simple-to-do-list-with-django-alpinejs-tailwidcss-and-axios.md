---
title: Simple To-Do List With Django, Alpine.Js, Tailwidcss, And Axios
description: Create a To-Do List with Django, Django Rest Framework, Alpine.js, TailwindCSS and Axios Js
date: 2020-09-21
author: Maciej Janowski
image: https://cdn.buttercms.com/zjKFrQRkSw2EjMmB3Jev
layout: article
tags: articles
---
While back I wrote a tutorial on how to make a todo app with Django, Alpine.js, and Axios, however, there was some room for improvement as I was just beginning with Alpine, so I decided to write a new version.

In this tutorial, I will show you how to create a simple and beautiful ToDo app with 

- Django
- TailwindCSS
- Alpine.js
- Axios

We will divide this into 2 parts

- Building The Backend with Django
- Building the Front-end and connecting it with the Backend using TailwindCSS, Alpine.js, and Axios

Check the finished project on [GitHub](https://github.com/druidmaciek/Alpine.js-Django-Todo-List)

## Back-end

Let’s start by creating a new project and its virtualenvironment, and installing Django

```python
pip install Django
```

Then create a Django project, an app called `tasks`

```python
django-admin startproject todo_list .
django-admin startapp tasks
```

Add tasks applications to `INSTALLED_APPS` in the `settings.py` file.

```python
INSTALLED_APPS = [
    ‘django.contrib.admin’,
    ‘django.contrib.auth’,
    ‘django.contrib.contenttypes’,
    ‘django.contrib.sessions’,
    ‘django.contrib.messages’,
    ‘django.contrib.staticfiles’,
    ‘tasks’ # Add newly created app
]
```

Now to go the `tasks` app, and `models.py` file, and create a model for our task

```python
from django.db import models

class Task(models.Model):
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
```

To keep things simple we just use two fields `title` and `completed`

Next let’s create views for reading, creating, deleting, and updating the status of the task.

```python
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from tasks.models import Task

def task_list(request):
    tasks = [{“id”: task.id,
              “title”: task.title,
              “completed”: task.completed} for task in Task.objects.all()]
    return JsonResponse(status=200, data=tasks, safe=False)

def create_task(request):
    title = request.POST.get(‘title’)
    if not title:
        return JsonResponse(status=400, data={‘error’: ‘title is required’})
    task = Task.objects.create(title=title)
    return JsonResponse(status=201, data={‘title’: task.title,
                                          ‘completed’: task.completed,
                                          ‘id’: task.id}, safe=False)

def delete_task(request, task_id):
    task = get_object_or_404(Task, pk=task_id)
    task.delete()
    return JsonResponse(status=204, data={‘message’: ‘task deleted’})

def update_task_status(request, task_id):
    task = get_object_or_404(Task, pk=task_id)
    status = request.POST.get(‘status’)
    if not status:
        return JsonResponse(status=400, data={‘error’: ‘status is required’})
    task.completed = int(status)
    task.save()
    return JsonResponse(status=204, data={‘message’: ‘task status updated’})
```

Now let’s create `urls.py` file inside our `tasks` app, and create url routes for our views.

```python
from django.urls import path

from . import views

urlpatterns = [
    path(‘tasks/’, views.task_list, name=‘task_list’),
    path(‘tasks/create/’, views.create_task, name=‘create_task’),
    path(‘tasks/<int:task_id>/delete/’, views.delete_task, name=‘delete_task’),
    path(‘task/<int:task_id>/update/’, views.update_task_status, name=‘update_task’)
]
```

Now go to the main `urls.py` file of our application and include the tasks app urls.

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path(‘admin/’, admin.site.urls),
    path(″, include(‘tasks.urls’)),
]
```

Now run the migrations, and start our app

```python
python manage.py makemigratinos
python manage.py migrate
python manage.py runserver
```

Now using HTTP client ( i am using [httpie](https://httpie.org), but you can use any other tool like [postman](https://www.postman.com) or [insomia](https://insomnia.rest))

test our endpoints. Here are the httpie commands I am using.

```python
# Making Get request to retrive task list
http http://127.0.0.1:8000/tasks

# To test the POST/DELETE request you will need to add @csrf_exempt 
# decorator to the views, to bypass the csrf token check, 
# so you don’t need to pass csrf token in http client.
# Once we will be building front-end part you can delete the decorator

# Making POST request to create a task 
http -f POST http://127.0.0.1:8000/tasks/create/ title=“Clean the dishes”

# Making task Delete request 
http -f DELETE http://127.0.0.1:8000/tasks/1/delete/

# Making POST request to update a task status
http -f POST http://127.0.0.1:8000/tasks/2/update/ status=1
```

Create a few tasks to populate our database.

Before moving to the front-end let’s create last view for the home page. Go to `views.py` file and create a simple view.

```python
def index(request):
    return render(request, ‘index.html’)
```

Finally add it to the `urls.py` of the `tasks` app.

```python
urlpatterns = [
    path(″, views.index, name=‘index’),
    path(‘tasks/’, views.task_list, name=‘task_list’),
    path(‘tasks/create/’, views.create_task, name=‘create_task’),
    path(‘tasks/<int:task_id>/delete/’, views.delete_task, name=‘delete_task’),
    path(‘tasks/<int:task_id>/update/’, views.update_task_status, name=‘update_task’)
]
```

## Front-end

In the `tasks` application create a directory called `templates` and inside a file called `index.html`

Include CDNs for TailwindCSS, Alpine.js and Axios in the `<head>`

```html
<!DOCTYPE html>
<html lang=“en”>
  <head>
    <meta charset=“UTF-8”>
    <meta name=“viewport” content=“width=device-width, initial-scale=1.0”>
    <meta http-equiv=“X-UA-Compatible” content=“ie=edge”>
    <title>Simple ToDo List</title>

    <link href=“https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css” rel=“stylesheet”>
    <script src=“https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js” defer></script>
    <script src=“https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.min.js” defer></script>

  </head>

  <body>

  </body>
</html>
```

We need to create a simple form for adding tasks, and  task list component.

Let’s start with the form. Add the input and button for adding tasks inside the body

```html
<div class=“max-w-4xl mx-auto mt-6”>

      <div class=“text-5xl font-extrabold leading-none tracking-tight text-center”>
          <h1 class=“bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-pink-600 to-purple-900”>Simple To-Do List</h1>
      </div>

      <!-- Task Input -->
      <div id=“task-input” class=“mt-4 flex justify-center”>
          <div class=“m-4 flex”>
              <input class=“rounded-l-lg p-4 border-t mr-0 border-b border-l text-gray-800 border-gray-200” placeholder=“Task Title”/>
              <button class=“px-8 rounded-r-lg bg-purple-800 text-gray-100 font-bold p-4 uppercase”>Add Task</button>
          </div>
      </div>

  </div>
```

![https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e657f2ca-4b5e-4579-a409-fb84ecc975c6/Screenshot_2020-09-19_at_17.25.53.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20200921%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20200921T174742Z&X-Amz-Expires=86400&X-Amz-Signature=99da00591a51ae5f9cb562f29f0eba57ad74af4132ee04525f76ec257373220b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Screenshot_2020-09-19_at_17.25.53.png%22](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e657f2ca-4b5e-4579-a409-fb84ecc975c6/Screenshot_2020-09-19_at_17.25.53.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20200921%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20200921T174742Z&X-Amz-Expires=86400&X-Amz-Signature=99da00591a51ae5f9cb562f29f0eba57ad74af4132ee04525f76ec257373220b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Screenshot_2020-09-19_at_17.25.53.png%22)

Now let’s create a task component, we need one for a completed task and one for an uncompleted one.

```html
<!-- Task Input -->
<div id=“task-input” class=“mt-4 flex justify-center”>
    <div class=“m-4 flex”>
        <input class=“rounded-l-lg p-4 border-t mr-0 border-b border-l text-gray-800 border-gray-200” placeholder=“Task Title”/>
        <button class=“px-8 rounded-r-lg bg-purple-800 text-gray-100 font-bold p-4 uppercase”>Add Task</button>
    </div>
</div>

<!-- Task List -->
<div id=“task-list” class=“max-w-md mx-auto grid grid-cols-1 gap-2 mt-6”>

    <!-- Task in progress -->
    <div class=“p-4 bg-white hover:bg-gray-100 cursor-pointer flex justify-between items-center border rounded-md”>
        <p>Uncompleted Task</p>
        <button type=“button”>
            <svg class=“h-6 w-6 text-gray-500 hover:text-green-500” xmlns=“http://www.w3.org/2000/svg” fill=“none” viewBox=“0 0 24 24” stroke=“currentColor”>
                <path stroke-linecap=“round” stroke-linejoin=“round” stroke-width=“2” d=“M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z” />
            </svg>
        </button>
    </div>

    <!-- Completed Task -->
    <div class=“p-4 bg-white hover:bg-gray-100 cursor-pointer flex justify-between items-center border rounded-md”>
        <p class=“line-through”>Completed Task</p>
        <svg class=“h-6 w-6 text-green-500” xmlns=“http://www.w3.org/2000/svg” viewBox=“0 0 20 20” fill=“currentColor”>
            <path fill-rule=“evenodd” d=“M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z” clip-rule=“evenodd” />
        </svg>
    </div>

</div>
```

![https://s3.us-west-2.amazonaws.com/secure.notion-static.com/c1ad425b-fc5d-4abb-8d5b-d3b7631bf5c8/Screenshot_2020-09-19_at_17.32.43.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20200921%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20200921T174959Z&X-Amz-Expires=86400&X-Amz-Signature=4f6105c9f175ea278ef974bea2dfed0790197c15adcc650666815d46b60121c2&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Screenshot_2020-09-19_at_17.32.43.png%22](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/c1ad425b-fc5d-4abb-8d5b-d3b7631bf5c8/Screenshot_2020-09-19_at_17.32.43.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20200921%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20200921T174959Z&X-Amz-Expires=86400&X-Amz-Signature=4f6105c9f175ea278ef974bea2dfed0790197c15adcc650666815d46b60121c2&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Screenshot_2020-09-19_at_17.32.43.png%22)

Ok now we have our HTML, ready let’s connect it all together using Alpine.js and Axios

Let’s start by populating the list with the initial tasks, we created earlier. 

Open a `<script>` tag before closing the body tag and create a function for Alpine components.

We will create a `tasks` array to hold our tasks, and couple functions equavilent to the endpoints we created earlier in `views.py`

```html
<script>
    function todos() {
        return {
            tasks: [],
            loadTasks() {},
            addTask() {},
            deleteTask(taskId) {},
            updateTask() {},
        }
    }
  </script>
</body>
```

Let’s start with `loadTasks()` 

```jsx
loadTasks() {
    let self = this;
    axios.get(’http://127.0.0.1:8000/tasks/’)
      .then(function (response) {
        // handle success
        self.tasks = response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
}
```

Now let’s go back to HTML, and add `x-data` properties and `x-init` to the div enclosing the task input and task list.

```html
<div x-data=“todos()” x-init=“loadTasks()” class=“max-w-4xl mx-auto mt-6”>
```

x-init is used to run a function once a component is initialized, so we will get the list of the tasks we have. Now go to the task list div and inside create a `<template>` tag enclosing the task component, and add `x-for` property to iterate through all tasks on the list

```html
<!-- Task List -->
<div id=“task-list” class=“max-w-md mx-auto grid grid-cols-1 gap-2 mt-6”>
    <template x-for=“task in tasks”>
        <div class=“p-4 bg-white hover:bg-gray-100 cursor-pointer flex justify-between items-center border rounded-md”>
            <p>Uncompleted Task</p>
            <button type=“button”>
                <svg class=“h-6 w-6 text-gray-500 hover:text-green-500” xmlns=“http://www.w3.org/2000/svg” fill=“none” viewBox=“0 0 24 24” stroke=“currentColor”>
                    <path stroke-linecap=“round” stroke-linejoin=“round” stroke-width=“2” d=“M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z” />
                </svg>
            </button>
        </div>
    </template>
</div>
```

Now when you reload your page you should have couple of tasks, now let’s modify the task component to be populated with data from our `/tasks/` endpoint.

On the `<p>` tag we will use the `x-text` property, and `:class`  to bind the `line-through` class based on task status, finally we will use `x-show` to display the right task icon based on task status.

Your new task list should look like that

```html
<!-- Task List -->
<div id=“task-list” class=“max-w-md mx-auto grid grid-cols-1 gap-2 mt-6”>
    <template x-for=“task in tasks”>
        <div class=“p-4 bg-white hover:bg-gray-100 cursor-pointer flex justify-between items-center border rounded-md”>
            <p :class=“{ ‘line-through’: task.completed }” x-text=“task.title”></p>
            <button type=“button”>
                <svg x-show=“!task.completed” class=“h-6 w-6 text-gray-500 hover:text-green-500” xmlns=“http://www.w3.org/2000/svg” fill=“none” viewBox=“0 0 24 24” stroke=“currentColor”>
                    <path stroke-linecap=“round” stroke-linejoin=“round” stroke-width=“2” d=“M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z” />
                </svg>
                <svg x-show=“task.completed” class=“h-6 w-6 text-green-500 hover:text-gray-500” xmlns=“http://www.w3.org/2000/svg” viewBox=“0 0 20 20” fill=“currentColor”>
                    <path fill-rule=“evenodd” d=“M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z” clip-rule=“evenodd” />
                </svg>
            </button>
        </div>
    </template>
</div>
```

![https://s3.us-west-2.amazonaws.com/secure.notion-static.com/d8d0afeb-1373-47ec-bef0-1c5aa8ff61d1/Screenshot_2020-09-20_at_11.30.40.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20200921%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20200921T175032Z&X-Amz-Expires=86400&X-Amz-Signature=34b0cf354b3f813c4edc41222627b79bc196703a515155ba7dfe6887deb9df8b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Screenshot_2020-09-20_at_11.30.40.png%22](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/d8d0afeb-1373-47ec-bef0-1c5aa8ff61d1/Screenshot_2020-09-20_at_11.30.40.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20200921%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20200921T175032Z&X-Amz-Expires=86400&X-Amz-Signature=34b0cf354b3f813c4edc41222627b79bc196703a515155ba7dfe6887deb9df8b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Screenshot_2020-09-20_at_11.30.40.png%22)

Now let’s make the input work. Go back to the script tag and finish the `addTask()` function, and also add a new variable to `taskTitle`

```jsx
taskTitle: ″,
addTask() {
    let self = this;
    let params = new URLSearchParams();
    params.append(‘title’, this.taskTitle );
    axios.post(‘http://127.0.0.1:8000/tasks/create/’, params,
        {
            headers: { ‘X-CSRFToken’: ‘{{ csrf_token }}’ },
        }
        )
        .then(function (response) {
            self.tasks.push(response.data);
            self.taskTitle = ″;
        }).catch(function (error) {
        // handle error
        console.log(error);
      });
},
```

In this function we create a new task, and on append the task to the `tasks` array, and reset the `taskTitle` variable, so the DOM will be updated. Now we just need to bind the `taskTitle` with the input using `x-model` property, and fire off the `addTask()` function on button click, using `@click`

```html
<!-- Task Input -->
<div id=“task-input” class=“mt-4 flex justify-center”>
    <div class=“m-4 flex”>
        <input x-model=“taskTitle” class=“rounded-l-lg p-4 border-t mr-0 border-b border-l text-gray-800 border-gray-200” placeholder=“Task Title”/>
        <button @click=“if (taskTitle) { addTask() } else { alert(‘task title cannot be empty’)}” 
								class=“px-8 rounded-r-lg bg-purple-800 text-gray-100 font-bold p-4 uppercase”>Add Task</button>
    </div>
</div>
```

Now try adding couple of tasks, magic!

**Deleting Tasks**

Now let’s make deleting task works. First let’s modify the task component, by adding button for deleting tasks, we will also include the `@click` to trigger the deleteTask function

```html
<!-- Task List -->
<div id=“task-list” class=“max-w-md mx-auto grid grid-cols-1 gap-2 mt-6”>
    <template x-for=“task in tasks”>
        <div class=“p-4 bg-white hover:bg-gray-100 cursor-pointer flex justify-between items-center border rounded-md”>
            <p :class=“{ ‘line-through’: task.completed }” x-text=“task.title”></p>
            <div class=“flex”>
                <button  class=“mr-4” type=“button”>
                    <svg x-show=“!task.completed” class=“h-6 w-6 text-gray-500 hover:text-green-500” xmlns=“http://www.w3.org/2000/svg” fill=“none” viewBox=“0 0 24 24” stroke=“currentColor”>
                        <path stroke-linecap=“round” stroke-linejoin=“round” stroke-width=“2” d=“M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z” />
                    </svg>
                    <svg x-show=“task.completed” class=“h-6 w-6 text-green-500 hover:text-gray-500” xmlns=“http://www.w3.org/2000/svg” viewBox=“0 0 20 20” fill=“currentColor”>
                        <path fill-rule=“evenodd” d=“M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z” clip-rule=“evenodd” />
                    </svg>
                </button> 
                <button @click=“deleteTask(task.id)” type=“button”>
                    <svg class=“h-6 w-6 text-red-400 hover:text-red-600” xmlns=“http://www.w3.org/2000/svg” fill=“none” viewBox=“0 0 24 24” stroke=“currentColor”>
                        <path stroke-linecap=“round” stroke-linejoin=“round” stroke-width=“2” d=“M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16” />
                    </svg>
                </button>
            </div>
        </div>
    </template>
</div>
```

Now scroll down and finish up `deleteTask(taskId)` function.

```jsx
deleteTask(taskId) {
  let self = this;
  axios.post(‘http://127.0.0.1:8000/tasks/’ + taskId +  ‘/delete/’, {},
  { headers: { ‘X-CSRFToken’: ‘{{ csrf_token }}’ }})
      .then(function (response) {
          let removeIndex = self.tasks.map(item => item.id).indexOf(taskId);
          ~removeIndex && self.tasks.splice(removeIndex, 1);
      }).catch(function (error) {
      // handle error
      console.log(error);
      });
},
```

And now we can remove the tasks from the list

**Updating Task Status**

Let’s finish `updateTask(task)` function

```jsx
updateTask(task) {
    let self = this;
    let params = new URLSearchParams();
    if (task.completed) {
        params.append(‘status’, 0);
    } else {
        params.append(‘status’, 1);
    }
    axios.post(‘http://127.0.0.1:8000/tasks/’ + task.id + ‘/update/’, params,
        { headers: { ‘X-CSRFToken’: ‘{{ csrf_token }}’ }})
    .then(function (response) {
        task.completed = !task.completed;
    }).catch(function (error) {
        // handle error
        console.log(error);
    });
}
```

And add `@click` property to update button 

```html
<button @click=“updateTask(task)”  class=“mr-4” type=“button”>
    <svg x-show=“!task.completed” class=“h-6 w-6 text-gray-500 hover:text-green-500” xmlns=“http://www.w3.org/2000/svg” fill=“none” viewBox=“0 0 24 24” stroke=“currentColor”>
        <path stroke-linecap=“round” stroke-linejoin=“round” stroke-width=“2” d=“M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z” />
    </svg>
    <svg x-show=“task.completed” class=“h-6 w-6 text-green-500 hover:text-gray-500” xmlns=“http://www.w3.org/2000/svg” viewBox=“0 0 20 20” fill=“currentColor”>
        <path fill-rule=“evenodd” d=“M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z” clip-rule=“evenodd” />
    </svg>
</button>
```

Test it out, and as you can see the task status updates, and the task updates its look!

In this tutorial, you learned how to make a simple to-do list with Django and Alpine.js.

Give me a follow on [Twitter](https://twitter.com/MaciejJanowski), to stay up to date on my latest articles.