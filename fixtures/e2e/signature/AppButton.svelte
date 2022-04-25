<p class="foo" />

<style lang="scss">
.test {
  @include square();
  @include square(1,);

  content: pow() + pow(1,);
}
</style>
