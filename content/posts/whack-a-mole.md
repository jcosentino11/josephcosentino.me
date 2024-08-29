---
title: "Building an online whack-a-mole game"
date: 2024-08-10T19:00:00-00:00
---

The past few weeks, I felt compelled to write an online multiplayer game in Erlang for no good reason at all, other than it seemed like fun. I picked whack-a-mole mostly because it was really simple to represent...I wanted to mess around with game queueing and the game protocol rather than game mechanics, etc. Erlang felt like a natural choice for a game server since it excels at things like concurrency / handling many connections.

At first I tried using Phoenix Framework/Elixir because it was new to me, and LiveView felt like it would be a good fit. However, since whack-a-mole is a toy project, I found myself not needing much of the functionality Phoenix provides, to the point where I felt like I was fighting with the framework. While I'm sure Phoenix would be great for building out a more productionized game, I really just wanted to use plain old Erlang and keep things really basic.

The first step was getting a really basic server up and having the client talk to it. I used [cowboy](https://github.com/ninenines/cowboy) library for handling websocket connections, and for serving out the JavaScript client.  The only thing missing for me was templating for static files, so I ended up [writing a cowboy handler](https://github.com/jcosentino11/whack-a-mole/blob/main/src/http/whackamole_template.erl) that fed files to [bbmustache](https://github.com/soranoba/bbmustache). In retrospect it was probably too much effort for the return; I only used it to template out the websocket protocol in the Javascript client (`ws` was fine for development, but when I had it deployed to my https site, browsers required `wss`).

Next was being able to spin up games (as Erlang processes) and add players to them.  The approach was basic: as players connect, try to put them into a game. If the game is full, create a new game and add them to it. If a player disconnects and their game hasn't started yet, remove them so that someone else can join.  This ended up being the [game manager](https://github.com/jcosentino11/whack-a-mole/blob/main/src/game/whackamole_game_manager.erl).

Then it was a matter of building out the actual game playing functionality, which is really just one action... hit the mole. So when a player hits a mole, the server confirms that it was actually a hit, then updates the game state for that player and emits that state to all the other players so they're in sync. 

The [game loop](https://github.com/jcosentino11/whack-a-mole/blob/fa5dafd32978b241aab41559457f64064b9b6601/src/game/whackamole_game.erl#L26-L87) reads really well in Erlang in my opinion:
```
receive
    stop ->
        game_over(GameState),
        ok;
    {add_player, Player, CallerPid} ->
        case add_player(Player, GameState) of
            full ->
                CallerPid ! full,
                game(GameState);
            {#player{player_id = PlayerId} = UpdatedPlayer, UpdatedGameState} ->
                GameId = self(),
                UpdatedGameState2 = UpdatedGameState#game{game_id = GameId},
                notify_ws([UpdatedPlayer], {player_added, PlayerId, GameId}),
                CallerPid ! ok,
                game(UpdatedGameState2)
        end;
    {start_game, CallerPid} ->
        case State of
            ready ->
                UpdatedGameState = GameState#game{state = started},
                whackamole_metrics:emit_game_started(),
                notify_ws(Players, UpdatedGameState),
                erlang:send_after(Duration, self(), game_over),
                erlang:send_after(UpdateInterval, self(), next_board),
                CallerPid ! ok,
                game(UpdatedGameState);
            _ ->
                CallerPid ! error,
                game(GameState)
        end;
    {hit, PlayerId, Index} ->
        case State of
            started ->
                UpdatedGameState = hit(GameState, PlayerId, Index),
                game(UpdatedGameState);
            _ ->
                game(GameState)
        end;
    {player_left, PlayerId} ->
        io:format("player left. id: ~p~n", [PlayerId]),
        #game{players = UpdatedPlayers} = UpdatedGameState = remove_player(PlayerId, GameState),
        notify_ws(Players, UpdatedGameState),
        case length(UpdatedPlayers) of
            0 ->
                game_over(GameState),
                no_players_left;
            _ ->
                game(UpdatedGameState)
        end;
    game_over ->
        game_over(GameState);
    next_board ->
        case State of
            started ->
                erlang:send_after(UpdateInterval, self(), next_board),
                UpdatedGameState = next_board(GameState),
                notify_ws(Players, UpdatedGameState),
                game(UpdatedGameState);
                _ ->
            game(GameState)
        end
end.
```

Writing the JavaScript client from scratch was a fun experience. It started out as [just a bunch of functions](https://github.com/jcosentino11/whack-a-mole/blob/2757cb07fb7636e4e08e551e0244c1273ac3c89f/priv/templates/client.js), and after some iterations and refactoring, [grew into a probably-overkill event-based system](https://github.com/jcosentino11/whack-a-mole/blob/main/priv/templates/client.js) that re-rendered parts of the game only if the relevant state changed. 

Some random stuff I learned in the process:
* JavaScript lets you have private class functions (e.g. `#myPrivateFunction(){}`)
* `Object.freeze` exists
* `=>` binds `this` to what you want it to be, but forgeting to use `=>` is a real PITA to track down
* My UI / visual design skills are tragic at best

Now with the game built out it was time to play it! Turns out playing by myself is a real drag....so I invited a bunch of my closest friends to the party. And by friends, I mean [bots](https://github.com/jcosentino11/whack-a-mole/blob/main/src/bot/whackamole_bot.erl). As an added bonus, the bots also serve as a means of testing the system itself, since they connect via websockets like any other player would.

I hosted whack-a-mole on DigitalOcean's App Platform for a while, but eventually stopped because even burning $5 a month seemed silly for something no one is actually going to play 🙃. I will say the experience of just hooking up a github repo to the service, rather than hacking together github actions workflows, was very pleasant.

Anyway, feel free to take a look at the code,

https://github.com/jcosentino11/whack-a-mole

or give it a spin, 

```
docker run -p 8080:8080 jcosentino11/whack-a-mole:latest
open "http://localhost:8080"
```

Don't forget to like and subscribe!
