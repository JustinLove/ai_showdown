## 1.2.0

- No longer processes `ai_config`, which appears in personality
- Update personality format to handle LOC tags and `display_name`
- Personality list no longer observable

## 1.1.0

- Do not generate a trailing dot identifier if there are no `rule_postfix` strings
- ais.json now supports `identifier` and `base_identifier`

## 1.0.0

- No longer generate commander files
- Generate personality tag rules instead of unittype rules.
- New property `personality_tag`, defaults to `name`
- New property `personality_file`, defaults to ai.js in mod or media
- Always attempts to create personalities with `personality_tags`
- Template expansion in `ai_config`, `path`, `base_path`, and `personality_file`, primarily for `<%= media %>`
- media path can now be overriden in the ai config file
- example config uses `server_mods` and `client_mods` paths

## 0.4.0

- Process subdirectories
- New ai property: `directory`, replaces `file_postfix`

## 0.3.1

- simple `ai_unit_map` no longer exists in windows version, media check with `ai_config` instead

## 0.3.0

- use the `unit_maps` and `platoon_templates` directories instead of single files, circa 82000-pte

## 0.2.1

- ensure `ai_unit_map` and `platoon_templates` exist before reading them

## 0.2.0

- Make renamed copies of individual `ai_config.json`
- Import personalities as server scene mod
- Install task to overwrite `commander_manager`
- Update commander names with AI name
- Use default commanders
- Typo correction in Queller
- Note node and grunt cli dependencies
- Note clean command (Many of these changes will affect files names, so projects should be cleaned)
