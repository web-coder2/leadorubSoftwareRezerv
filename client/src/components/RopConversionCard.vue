<template>
  <el-card class="conversion-card">

    <template #header>
        <h3>{{ value || 0 }} %</h3>
    </template>

    <span>Конверсия</span><br>
    <span>{{ description }}</span>
  </el-card>
</template>

<script>
export default {
  props: {
    value: {
      type: Number
    },
    description: String,
  }
}
</script>

<style >

.conversion-card {
  width: 250px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  padding: 10px;
  box-sizing: border-box;
  cursor: pointer;
}

.conversion-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

</style>