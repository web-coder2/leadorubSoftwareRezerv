<template>
  <h3>HBA-Лидорубы</h3>
  <p>Это Иновационый инстурмент для аналитики, просмотра, анализа работы лидорубов</p>

  <div v-if="isAdmin">
    <el-input :disabled="isLoading" style="width: 50%;" v-model="gte" type="date"></el-input><br>
    <el-button :disabled="isLoading" style="margin-top: 10px;" type="success" plain @click="startUpdateUsersStats('updateSalary')">Обновить зарплатную</el-button>
    <el-button :disabled="isLoading" style="margin-top: 10px;" type="success" plain @click="startUpdateUsersStats('updateLeads')">Обновить лиды</el-button>
  </div>

</template>

<script>

  import dayjs from 'dayjs'
  import { ElMessage } from 'element-plus';


  export default {

    data() {
      return {
        gte: dayjs(new Date).format('YYYY-MM-DD'),
        userData: null,
        userName: '',
        userRank: '',
        isAdmin: false,
        isLoading: false,
      }
    },
    methods: {
      async startUpdateUsersStats(mode) {
        try {

          this.isLoading = true

          const response = await this.$store.dispatch('getDataList', {
            col: 'api/salary/updateInfo',
            params: {
              gte: this.gte,
              mode: mode
            }
          })

          this.isLoading = false

          ElMessage({
            // message: `Статистика юзеров обновилась за ${dayjs(this.gte).format('YYYY-MM-DD')}`,
            message: response.msg,
            type: 'success',
          });

        } catch (e) {
          console.log(e.message)

          ElMessage({
            message: `error !!! ${e.message}`,
            type: 'error',
          });
        }
      }
    },
    beforeMount() {

      const userObjectString = localStorage.getItem('userObject');

      if (userObjectString) {
        this.userData = JSON.parse(userObjectString);
        this.userName = this.userData.name,
        this.userRank = this.userData?.rankName ?? null

        this.isAdmin = this.userRank === 'admin' ? true : false
      }

    }

  }

</script>