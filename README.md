# Generate_release_notes

## Inputs
```yaml
  GITHUB_TOKEN: 
    description: The YML workflow will need to set myToken with the GitHub Secret Token.
    required: true
    default: ' $CHANGES ' #$PREVIOUS_TAG $CHANGES $CONTRIBUTORS
  template:
    description: Template used to generate notes.
    required: false
  change-template:
    description: change template
    required: false
    default: '* $TITLE (#$NUMBER) @$AUTHOR' #$TITLE $NUMBER $AUTHOR $BODY $URL $BASE_REF_NAME $HEAD_REF_NAME
  category-template:
    description: category template
    required: false
    default: '## $TITLE'
  no-changes-template:
    description: no changes template
    required: false
    default: '* No changes'
  sort-by:
    description: pull request sort by
    required: false
    default: 'merged_at'
  sort-direction:
    description: pull request sort direction
    required: false
    default: 'descending'
  filter-by-commitish:
    description: filter by commitish
    required: false
    default: false
  categories:
    description: Used to display PR classification
    required: false
    default: '[]' #[{"title":"New features","labels":["feature","enhancement"]},{"title":"Bug fixes and improvements","labels":["bug"]}]
```

## Outputs
```yaml
body:
    description: The body of the drafted release.

```
