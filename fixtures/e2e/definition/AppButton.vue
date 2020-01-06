<template>
	<p class="foo"></p>
</template>

<script>
export default {

}
</script>

<style lang="scss">
.test {
  content: $variable + function();

  @include mixin();
}

</style>
