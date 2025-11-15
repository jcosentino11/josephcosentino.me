---
title: "Using Devbox"
date: 2025-11-14T22:36:48-05:00
---

Growing older to me means I want to spend even more time fiddling with my development workflows... 

My laptop is my temple—I don't want to pollute it every time I `brew install ...`. I've tried virtualenvs, Dockerfiles, virtual machines, you name it. So naturally, when my old coworker was raving about Nix, I wanted to try it out. And of course, I don't have the time or attention span to devote myself to learning Nix deeply, so I looked for a shortcut and landed on [devbox](https://www.jetify.com/devbox).

Here's an example devbox.json configuration I used when working on this very website. It installs everything needed for me to run `hugo server`....feels similar to a dockerfile.

```
{
  "$schema": "https://raw.githubusercontent.com/jetify-com/devbox/0.14.2/.schema/devbox.schema.json",
  "packages": [
    "go@1.24.3",
    "hugo"
  ],
  "shell": {
    "init_hook": [
      "hugo mod get -u github.com/jpanther/congo/v2"
    ]
  }
}
```

Turns out, having isolated dev environments for all my throwaway projects really does scratch the itch of keeping things neat and tidy. More importantly, it makes me feel like a hipster 😉.

I even went as far as to put an empty, unmodifiable `~/go` file on my system... that central dumping ground has always put me on edge a bit, so it's nice to never have to worry about that again. 

In doing so, I learned that vscode uses `~/go` when it installs go tools, so I had to modify that for all my projects:


settings.json (for vscode)
```json
{
    // override so we don't use GOPATH and accidentally clutter up home dir
    "go.toolsGopath": "${workspaceFolder}/.go",
}
```

There's enough boilerplate overall that I made a Github template repo for it, https://github.com/jcosentino11/go-project-template.


The main drawback I've run into with devbox is being limited by whatever package versions are available on nix. Golang, for example, is behind a minor version at the time of writing. Since I'm using this just for my personal use, it doesn't bother me all that much.
