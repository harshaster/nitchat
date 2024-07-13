<template>
    <div :style="{backgroundColor : this.color ? this.color : 'green'}"></div>
</template>

<script>
export default{
    props : ['color']
}
</script>
<style scoped>
    div{
        display: inline-block;
        background-color: green;
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }
</style>