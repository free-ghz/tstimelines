> What?

Script to batch and combine prompts against a [Textsynth](https://bellard.org/ts_server/) server.

> Why?

I set up a TS server on an old Esprimo and it's too slow to do anything realtime with it, but i still wanted to play with it a bit.

> How?

This is a node.js thingy. I built it with yarn. As is, you would run it like so:

```sh
yarn
yarn node index
```

To specify prompts, place YAML files in the `prompts/` directory. Multiple prompts can be placed in the same file, and/or spread over several files. They should follow this format:

```yaml
- title: some prompt
  prompt: My name is probably
  temperature: 5
  max_tokens: 3

- title: another
  prompt: |-
    Dear^some prompt^,
    We write to you today, because
  top_k: 200
  max_tokens: 200
```

Further examples in `prompts/promt.yaml.example`.