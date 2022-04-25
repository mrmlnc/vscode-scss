<p class="foo" />

<style lang="scss">
$color: blue;
$fonts: -apple-system;

.foo {
  color: $;
}

@import "~foo/bar.scss";

.foo {
  color: $;
}

@import "./partial";

.foo {
  color: $;
}
</style>
