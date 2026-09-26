<template>
    <h3>Зарплатная</h3>


    <el-form inline>
        <el-form-item label="Начало">
          <!-- <el-date-picker v-model="gte" type="date" style="width: 200px"/> -->
            <el-input v-model="gte" type="date" style="width: 200px"/>
        </el-form-item>
        <el-form-item label="Конец">
          <!-- <el-date-picker v-model="lte" type="date" style="width: 200px"/> -->
          <el-input v-model="lte" type="date" style="width: 200px"/>
        </el-form-item>
        <el-form-item>
            <el-button type="success" plain @click="getSalaryData">Применить</el-button>
        </el-form-item>
    </el-form>

    <div style="margin-top: 30px; margin-bottom: 30px">
        <!-- easy buttons -->
        <el-button @click="easyGetSalary('today')">сегодня</el-button>
        <el-button @click="easyGetSalary('yesterday')">вчера</el-button>
        <el-button @click="easyGetSalary('week')">неделя</el-button>
        <el-button @click="easyGetSalary('prevWeek')">прошлая неделя</el-button>
        <el-button @click="easyGetSalary('month')">месяц</el-button>
        <el-button @click="easyGetSalary('prevMonth')">прошлый месяц</el-button>

        <el-button v-if="userRole === 'admin' && leadorubsTop" @click="openModalWithBest">Лучший лидоруб</el-button>
    </div>

    <el-button @click="isShowClearCalculation = true" v-if="userRank === 'admin'">Проверить чистую</el-button>

    <el-table :data="salaryTableData" style="width: 100%">
        <el-table-column :width="userColumnWidth" fixed="left"  prop="name" label="Имя">
            <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>Имя</span>
                    <el-button v-if="isMobile" size="mini" circle @click="toggleWidthColumn">
                        <el-icon>
                            <ArrowRight v-if="showFullUserCol === true" />
                            <ArrowDown v-if="showFullUserCol === false" />
                        </el-icon>
                    </el-button>
                </div>
            </template>
            <template #default="{ row }">
                <div class="login-container">
                    <img v-if="row.avatar" class="user-avatar" :src="`${apiBase}public/avatars/${row.avatar}`">
                    <el-icon v-if="!row.avatar" class="user-icon">
                        <User class="icon-self" />
                    </el-icon>
                    <span class="header-ellipsis">{{ row.name }}</span>
                </div>
            </template>
        </el-table-column>
        <!-- <el-table-column prop="email" label="Логин"></el-table-column> -->
        <el-table-column :width="100" prop="countCalls" label="Звонки"></el-table-column>
        <!-- <el-table-column :width="100" v-if="userRole === 'admin'" prop="countCallsWithProfile" label="Звонки из профиля"></el-table-column> -->
        <el-table-column :width="100" prop="countLeads" label="Лиды"></el-table-column>
        <el-table-column :width="100" prop="countTargets" label="Целевые"></el-table-column>
        <el-table-column :width="100" prop="countHolds" label="Холды"></el-table-column>

        <el-table-column :width="100" prop="countHolds" label="CTR">
            <template #default="{ row }">
                <span v-if="row.countHolds > 0 && row.countTargets > 0">{{ Math.round(row.countHolds / row.countTargets * 100) || 0 }} %</span>
                <span v-else>0 %</span>
            </template>
        </el-table-column>

        <el-table-column :width="100" prop="salaryToLeads" label="ЗП за лиды"></el-table-column>

        <el-table-column :width="100" v-if="userRole === 'admin'" prop="sumHold" label="Сумма холдов"></el-table-column>
        <el-table-column :width="100" prop="salary" label="Зарплата"></el-table-column>
        <!-- TODO вместо scriptBonus потом отрендерить bonusTenPercents он будет 0 или реал значение если lte ставится на последний день месяца -->
        <!-- TODO это значение поставить перед новой мотивацией -->
        <el-table-column :width="100" prop="scriptBonus" label="Бонус"></el-table-column>
        <el-table-column :width="100" prop="salary + scriptBonus" label="Итого ЗП">
            <template #default="{ row }">
                <!-- <p>{{ row.salary + row.scriptBonus }}</p> -->
                <p>{{ row.salary + row.scriptBonus }}</p>
            </template>
        </el-table-column>
        <el-table-column :width="100" prop="clear" label="Чистая"></el-table-column>
        <!-- <el-table-column prop="brokerSalary" label="ЗП брокерам"></el-table-column> -->
    </el-table>

    <el-dialog title="Топ лидорубов" v-model="modalWithBestLidorub" width="500px">
        <h3>Топ лидорубов за месяц <span>{{ monthToBestLidorub }}</span></h3>
        <div v-for="(user, idx) in leadorubsTop" style="display: flex; align-items: center; border-bottom: solid 1px black;">
            <h3 :style="{ 'color': user.color }">{{ idx + 1 }} место</h3>
            <p style="margin-left: 20px;">{{ user.name }} - {{ user.clear }}</p>
        </div>
    </el-dialog>
    
</template>

<style>

.header-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 10px;
}

.leadCarder {
    border: solid 2px black;
    margin-bottom: 10px;
    padding-left: 10px;
    border-radius: 20px;
}

.comment-tooltip {
    max-width: 150px;
    text-wrap: wrap;
}

.avatar-preview {
    margin-top: 20px;
    margin-bottom: 20px;
}
  
.avatar-preview img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
}
  
.user-avatar {
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 50%;
}
  
.user-icon {
    width: 40px !important;
    height: 40px !important;
}

.icon-self {
    width: 20px !important;
    height: 20px !important;
}

.login-container {
    display: flex;
    align-items: center;
    float: left !important;
}

</style>

<script>

    import dayjs from 'dayjs'
    import axios from 'axios'
    import 'dayjs/locale/ru'

    dayjs.locale('ru')

    import { ArrowRight, ArrowDown, User } from '@element-plus/icons-vue'

    export default {
        data() {
            return {
                salaryTableData: [],
                gte: dayjs(new Date).format('YYYY-MM-DD'),
                lte: dayjs(new Date).format('YYYY-MM-DD'),
                userObject: null,
                userRole: null,
                showFullUserCol: true,
                isMobile: false,
                userColumnWidth: 150,
                leadorubsTop: null,
                monthToBestLidorub: null,
                modalWithBestLidorub: false,
                modalToShowLeads: false,
                leadsToRequireShow: [],
                leadorubToShowModal: null,
                totalSalaryNewToLeads: 0,
                apiBase: null
            }
        },
        components: {
            ArrowRight,
            ArrowDown,
            User
        },
        methods: {
            async getSalaryData() {
                const response = await this.$store.dispatch('getDataList', {
                    col: 'api/salary/get',
                    params: {
                        gte: dayjs(this.gte).format('YYYY-MM-DD'),
                        lte: dayjs(this.lte).format('YYYY-MM-DD')
                    }
                })
                this.salaryTableData = response.data
                await this.getBestLidorub()
            },
            showLeadsByUser(user) {
                this.modalToShowLeads = true
                this.leadsToRequireShow = user.targetLeadsArray
                this.leadorubToShowModal = user.name

                this.totalSalaryNewToLeads = user.targetLeadsArray.reduce((total, current) => {
                    return total += current.realSalaryToLead
                }, 0)
            },
            async getBestLidorub() {
                try {
                    const response = await this.$store.dispatch('getDataList', {
                        col: 'api/salary/bestLidorub',
                        params: {
                            date: dayjs(this.gte).format('YYYY-MM-DD')
                        }
                    })

                    this.leadorubsTop = response.data
                    this.monthToBestLidorub = dayjs(response.monthToBest).format('MMMM')

                } catch (e) {
                    console.log(e.message)
                }
            },
            toggleWidthColumn() {
                this.showFullUserCol =! this.showFullUserCol

                if (this.isMobile === false) {
                    this.userColumnWidth = 150
                } else if (this.isMobile === true) {
                    this.userColumnWidth = this.showFullUserCol ? 150 : 100
                }

            },
            async easyGetSalary(dayMode) {

                if (dayMode === 'today') {
                    this.gte = dayjs(new Date).format('YYYY-MM-DD')
                    this.lte = dayjs(new Date).format('YYYY-MM-DD')
                } else if (dayMode === 'yesterday') {
                    this.gte = dayjs(new Date).subtract(1, 'day').format('YYYY-MM-DD')
                    this.lte = dayjs(new Date).subtract(1, 'day').format('YYYY-MM-DD')
                } else if (dayMode === 'week') {
                    this.gte = dayjs(new Date).startOf('week').format('YYYY-MM-DD')
                    this.lte = dayjs(new Date).endOf('week').format('YYYY-MM-DD')
                } else if (dayMode === 'prevWeek') {
                    this.gte = dayjs(new Date).subtract(1, 'week').startOf('week').format('YYYY-MM-DD')
                    this.lte = dayjs(new Date).subtract(1, 'week').endOf('week').format('YYYY-MM-DD')
                } else if (dayMode === 'month') {
                    this.gte = dayjs(new Date).startOf('month').format('YYYY-MM-DD')
                    this.lte = dayjs(new Date).endOf('month').format('YYYY-MM-DD')
                } else if (dayMode === 'prevMonth') {
                    this.gte = dayjs(new Date).subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
                    this.lte = dayjs(new Date).subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
                }

                await this.getSalaryData()

            },
            async getUserStats() {
                this.userObject = this.$store.getters['getUserObject']
                this.userRole = this.userObject?.rankName ?? null
            },
            openModalWithBest() {
                this.modalWithBestLidorub = true
            },  
        },
        async beforeMount() {

            this.isMobile = window.innerWidth > 480 ? false : true

            this.apiBase = this.$store.getters['getApiBaseURL']

            await this.getSalaryData()
            await this.getUserStats()
        }
    }

</script>