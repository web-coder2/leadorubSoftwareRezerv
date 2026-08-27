<template>
    <div>
      <p style="font-size: 18px; font-weight: bold;">Статистика по лидам Личный кабинет {{ userName }}</p>
  
      <el-row :gutter="20" style="margin-top: 30px;">
        <el-col :span="countSpan" v-for="(date, index) in leadsWeekData" :key="index">
          <el-card shadow="hover">
            <div>
              <p style="margin-bottom: 8px;">Дата: <strong>{{ index }} {{ getDayOfWeek(index) }}</strong></p>
              <p style="margin-bottom: 8px;">Кол-во лидов: <strong>{{ date.length }}</strong></p>
            </div>
            <el-progress :text-inside="false" striped :percentage="getPercentFromAll(date.length)" :stroke-width="20" status="success"></el-progress>
          </el-card>
        </el-col>
      </el-row>
  
      <h4 style="margin-top: 30px;">Всего лидов за неделю: {{ allLeadsInWeek }}</h4>
    </div>
</template>

<script>

    import dayjs from 'dayjs'
    import 'dayjs/locale/ru'

    dayjs.locale('ru')

    export default {
        data() {
            return {
                leadsWeekData: [],
                allLeadsInWeek: 0,
                isMobile: false,
            }
        },
        props: {
            userName: {
                type: String,
                required: true,
                default: 'admin'
            }
        },
        computed: {
            countSpan() {
                return this.isMobile ? 24 : 8
            }
        },
        methods: {
            async getLeadIntensity() {
                const response = await this.$store.dispatch('getDataList', {
                    col: 'api/leads/intensity',
                    params: {
                        gte: dayjs().startOf('week').format('YYYY-MM-DD'),
                        userName: this.userName,
                    }
                })
                this.leadsWeekData = response.intensity

                for (let date in this.leadsWeekData) {
                    this.allLeadsInWeek += this.leadsWeekData[date].length
                }
            },
            getPercentFromAll(countLeads) {
                return Math.round(countLeads / this.allLeadsInWeek * 100)
            },
            getDayOfWeek(date) {
                return dayjs(date).format('dddd')
            }
        },
        async beforeMount() {

            this.isMobile = window.innerWidth > 480 ? false : true

            await this.getLeadIntensity()
        }
    }

</script>