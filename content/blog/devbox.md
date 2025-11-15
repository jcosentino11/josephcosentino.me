---
title: "Using Devbox"
date: 2025-11-14T22:36:48-05:00
---

For whatever bizarre reason, growing older to me means I want to spend even more time fiddling with my development workflows. 

My laptop is my temple--I don't want to pollute it with every `brew install ...` I run when I'm just trying out random things. I thought back to an old coworker, who was raving about the joys of nix, and I wanted to give it a try myself. Now, I'm not nearly as brave, so instead of using nix directly, I opted to go for devbox, which provides nix-like isolated environments in a manner that's friendlier to noobs.

Here's an example devbox.json configuration I use when working on this very website. It allows me to install everything I need to get `hugo` running....feels similar to a dockerfile.

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

Turns out, having isolated dev environments for all my throwaway projects really does scratch the itch of keeping things neat and tidy. Not to mention, it makes me feel nice and hipster.

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
