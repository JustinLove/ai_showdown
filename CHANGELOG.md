## 0.5.0

- No longer generate commander files
- Generate personality tag rules instead of unittype rules.
- New property `personality_tag`, defaults to `name`
- Add `personality_tags` to already processed personalities
- %media% in `path` and `base_path` will be replaced with the gruntfile media path

## 0.4.0

- Process subdirectories
- New ai property: `directory`, replaces `file_postfix`

## 0.3.1

- simple `ai_unit_map` no longer exists in windows verion, media check with `ai_config` instead

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
