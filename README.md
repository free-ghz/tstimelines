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

Pass `--base string` for baseurl and `--model string` for model name, like so: `yarn node index --base http://neytiri:8080/v1 --model falcon40`.

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
  requires:
    - some prompt
```

Further prompt examples in `prompts/promt.yaml.example`.

Default script behaviour is to run each prompt once, and then exit. Pass `--batch` to loop around the prompt list forever. Each loop re-reads the `prompts/` directory, meaning you could edit the prompt definitions between loops without restarting the script.

Output is stored in `output/` directory, sorted by prompt `title` property, as well as streamed to stdout.
