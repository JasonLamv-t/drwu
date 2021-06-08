<template>
  <div id="app">
    <router-view name="main"/>
    <router-view name="foot"/>
  </div>
</template>

<style>
#app {
  width: 100%;
  text-align: center;
  color: #2c3e50;

  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
