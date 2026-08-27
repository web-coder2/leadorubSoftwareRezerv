<template>

    <h3>{{ title }}</h3>

    <p>Выбрать дату</p>

    <div class="form-container">
        <el-input type="date" v-model="gte"></el-input>
        <el-input type="date" v-model="lte"></el-input>
    </div>

    <el-button @click="getDifinityCalls">Проверить совпдаение звонков</el-button>

    <el-skeleton style="margin-top: 30px;" :rows="5" animated v-if="isLoading"></el-skeleton>


    <div v-if="!isLoading" style="padding: 16px; font-family: Arial, sans-serif;">
        <div v-for="(user, index) in tableCallsData" :key="index" style="margin-bottom: 20px; border: 1px solid #ccc; border-radius: 8px; padding: 10px; background-color: #f9f9f9;">
          <h3 style="margin: 0 0 10px; color: #333;">{{ user.userName }}</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li v-for="(call, callIdx) in user.uniquePhones" :key="callIdx" style="padding: 6px 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 500;">{{ call.phone }}</span>
              <span style="font-size: 0.9em; color: #666;">{{ call.date }}</span>
            </li>
          </ul>
        </div>
      </div>

</template>


<style>

.form-container {
    width: 30%;
    margin-bottom: 30px;
}

</style>

<script>

    import dayjs from 'dayjs'

    export default {

        data() {
            return {
                title: 'Сверка телефонов ЛД',
                gte: dayjs('2026-03-23').format('YYYY-MM-DD'),
                lte: dayjs('2026-03-23').format('YYYY-MM-DD'),
                tableCallsData: null,
                isLoading: false, // а шруизтся этот апи запрос будет ооооочень долго поэтмоу наслаждайся анимацией
            }
        },
        methods: {
            async getDifinityCalls() {
                this.isLoading = true
                let response = await this.$store.dispatch('getDataList', {
                    col: 'api/test/diffinity',
                    params: {
                        gte: this.gte,
                        lte: this.lte
                    }
                })
                this.tableCallsData = response.data
                this.isLoading = false
            }
        }

    }


</script>