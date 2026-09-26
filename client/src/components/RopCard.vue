<template>
    <el-card class="compact-card">
        <div class="header">
            <div>
                <p>{{ title }}</p>
            </div>
            <el-icon>
                <component :style="{ color: iconColor }" :is="iconComponent" class="icon" />
            </el-icon>
        </div>

        <template #footer>
            <div class="card-footer">
                <p>{{ count }}</p>
                <p :style="{ color: percent > 0 ? 'green' : 'red' }">{{ percent > 0 ? '+' : '-' }} {{ Math.abs(percent) }}%</p>
            </div>
        </template>
    </el-card>
</template>

<script>
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { Phone, Wallet, User, Coin, Aim, Position, Warning, CircleClose  } from '@element-plus/icons-vue';

export default {
  props: {
    percent: Number,
    title: String,
    count: Number,
    iconName: String,
    iconColor: String
  },
  components: {
    Phone, Wallet, ArrowDown, ArrowUp, User, Coin, Aim, Position, Warning, CircleClose
  },
  computed: {
    iconComponent() {
      return this.iconName;
    },
  },
};
</script>

<style>

.compact-card {
  width: 300px !important;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: Arial, sans-serif;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.compact-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    font-size: 12px;
}

.trend-icon {
  font-weight: 900;
}
</style>