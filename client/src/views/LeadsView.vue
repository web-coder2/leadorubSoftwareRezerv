<template>
    <div>
      <h3>Лиды с БД</h3>

      <div class="form-filter">
        <el-input type="date" v-model="gte"></el-input>
        <el-input type="date" v-model="lte"></el-input>

        <el-select v-if="activeTab === 'leads'" style="margin-top:10px" v-model="selectedStatuses" multiple placeholder="Выбрать статус">
          <el-option v-for="status in statusesArray" :label="status" :value="status" :key="status"></el-option>
        </el-select>

        <!-- <el-select v-if="activeTab === 'leads'" style="margin-top:10px" v-model="selectedUsers" multiple placeholder="Выбрать юзера">
          <el-option v-for="user in usersArray" :label="user.name" :value="user.name" :key="user._id"></el-option>
        </el-select> -->

        <FormItemSelect style="margin-top: 10px" v-if="activeTab === 'leads' && usersArray.length > 0" v-model="selectedUsers" labelKey="name" valueKey="name" :multipleMode="true" placeholder="Лидорубы" :options="usersArray" />

        <el-select v-if="activeTab === 'leads'" style="margin-top:10px" v-model="filterOkk" placeholder="статус ОКК">
          <!-- <el-option label="все" value="all"></el-option> -->
          <el-option label="целевые" :value="true"></el-option>
          <el-option label="Нецелевые" :value="false"></el-option>
        </el-select>

        <el-select v-if="activeTab === 'leads'" style="margin-top:10px" v-model="filterUnique" placeholder="уникальность">
          <!-- <el-option label="все" value="all"></el-option> -->
          <el-option label="уникальные" :value="true"></el-option>
          <el-option label="повторные" :value="false"></el-option>
        </el-select>


        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <el-button @click="fetchLeads()" type="info" plain>Применить</el-button>
          <el-button @click="resetFilters()" type="warning" plain>Сбросить</el-button>
        </div>
      </div>

      <el-button v-if="rankName === 'admin'" style="margin-top: 20px; margin-bottom: 20px" type="success" plain @click="isShowModalCreateLead = true">Создать лид</el-button>
      <el-button v-if="rankName === 'admin'" style="margin-top: 20px; margin-bottom: 20px" type="success" plain @click="downloadLeads">Выгрузить лиды</el-button>
  
      <!-- Вкладки для выбора таблицы -->
      <el-tabs v-model="activeTab" style="margin-top: 20px" type="border-card" @tab-click="handleTabClick">
        <el-tab-pane label="Системные лиды" name="leads">
          <div class="table-data">
            <el-table :data="currentData" style="width: 100%">
              <el-table-column :width="100" prop="date" label="Дата"></el-table-column>
              <el-table-column fixed="left" :width="110" prop="phone" label="Телефон">
                <template #default="{ row }">
                  <p>{{ renderPhoneNumber(row.phone) }}</p>
                </template>
              </el-table-column>
              <el-table-column :width="160" prop="userName" label="Имя"></el-table-column>
              <el-table-column :width="110" prop="statusOKK" label="Статус ОКК">
                <template #default="{ row }">
                  <p>{{ row.statusOKK ? 'Целевой' : 'Нецелевой' }}</p>
                </template>
              </el-table-column>
              <el-table-column :width="160" prop="commentOKK" label="Коментарий"></el-table-column>
              <el-table-column :width="160" prop="selfLeadName" label="Сам перевел" />

              <!-- новые свойства рендерю в таблицу -->
              <el-table-column :width="150" prop="isUniquePhone" label="Уникальный">
                <template #default="{ row }">
                  <span :style="{'color': row.isUniquePhone ? 'green' : 'red'}">{{ row.isUniquePhone ? 'Уникальный' : 'был повтор' }}</span>
                </template>
              </el-table-column>
              <el-table-column :width="150" prop="lastPhoneCalled" label="Последний звонок"></el-table-column>
              <el-table-column :width="150" prop="uniqueState" label="Насколько уникальный"></el-table-column>

              <el-table-column :width="150" prop="leadSalaryPrice" label="Цена лида"></el-table-column>

              <el-table-column :width="160" prop="broker" label="Брокер"></el-table-column>
              <el-table-column :width="160" prop="residenceStatus" label="Статус">
                <template #default="{ row }">
                  <div class="custom" :style="{'background-color' : getTypeOfBadge(row.residenceStatus)}">
                    {{ row.residenceStatus }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column :width="160" v-if="rankName === 'admin'" prop="price" label="Цена"></el-table-column>
              <el-table-column :width="160" v-if="rankName === 'admin'" prop="countHold" label="Кол-во холдов">
                <template #default="{ row }">
                    <div style="display: flex; align-items: center">
                      <p>{{ row.countHold }}</p>
                      <el-button v-if="row.offersList.length > 0" @click="openInfoModalLead(row)" circle style="margin-left: 10px">
                        <el-icon>
                          <Plus/>
                        </el-icon>
                      </el-button>

                      <!-- если лид не был переводим можно добавить к нему оферы с статусами -->
                      <el-button v-if="row.offersList.length === 0" @click="openInfoModalLead(row)" circle type="danger" plain style="margin-left: 10px">
                        <el-icon>
                          <Plus/>
                        </el-icon>
                      </el-button>

                    </div>
                </template>
              </el-table-column>
            </el-table>
  
            <Pagination :tableData="leadsTableData" :rowsInPage="rowsInPage" @page-change="handlePageChange"></Pagination>
          </div>
        </el-tab-pane>
  
        <el-tab-pane v-if="rankName === 'admin'" label="ручные лиды" name="another">
            <p style="margin-top: 10px; marign-bottom: 10px">посмотреть те лиды которые создали вручную и удалить дубли или тестовые</p>
            <el-table :data="handCurrentLeads" style="width: 100%">
                <el-table-column prop="date" label="Дата"></el-table-column>
                <el-table-column prop="phone" label="Телефон"></el-table-column>
                <el-table-column prop="userName" label="Имя"></el-table-column>
                <el-table-column prop="broker" label="Брокер"></el-table-column>
                <el-table-column prop="countHold" label="Кол-во холдов"></el-table-column>
                <el-table-column v-if="rankName === 'admin'" prop="price" label="Цена"></el-table-column>
                <el-table-column prop="residenceStatus" label="статус">
                  <template #default="{ row }">
                    <el-badge :value="row.residenceStatus" :type="getTypeOfBadge(row.residenceStatus)"></el-badge>
                  </template>
                </el-table-column>
                <el-table-column prop="selfLeadName" label="сам перевел"></el-table-column>
                <el-table-column prop="statusOKK" label="ОКК"></el-table-column>
                <el-table-column label="Действие">
                  <template #default="{ row }">
                    <el-button type="danger" plain @click="deleteLead(row)">
                      <el-icon>
                        <Delete />
                      </el-icon>
                      <span style="margin-left: 5px">Удалить</span>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog title="Информация о системном лиде" v-model="isShowModalLeadInfo" width="700px">
      <h3 style="margin-bottom: 15px;">С этого лида была переведено:</h3>
      <el-switch v-model="isLeadOffersEdit" active-text="редактировать" inactive-text="прочитать"></el-switch>
    
      <div style="margin-top: 20px;">

        <!-- прочитать инфу о оферах лида -->
        <ul v-if="!isLeadOffersEdit && !leadUpdatedLoading" style="list-style: none; padding: 0;">
          <li v-for="(item, index) in isShowLeadObjectToModal.offersList" :key="index" style="margin-bottom: 12px;">
            <el-card shadow="hover" style="border-radius: 8px; padding: 12px;">
              <p><strong>Оффер:</strong> {{ item.offerName }}</p>
              <p><strong>Цена:</strong> {{ item.price }}</p>
              <p><strong>Брокер:</strong> {{ item.broker }}</p>
              <p><strong>Статус:</strong> {{ item.status }}</p>
            </el-card>
          </li>
        </ul>
    
        <!-- изменение оферов из оферсЛист лида -->
        <div v-if="isLeadOffersEdit">
          <div v-if="!leadUpdatedLoading" v-for="(item, index) in isShowLeadObjectToModal.offersList" :key="index" style="margin-bottom: 16px;">
            <el-card shadow="hover" style="background-color: #f5f5f5; border-radius: 8px; padding: 16px;">
              <el-form label-position="top" label-width="100px" style="margin-bottom: 10px;">
                
                <el-form-item label="Оффер">
                  <el-input v-model="item.offerName" placeholder="Введите название оффера" />
                </el-form-item>
                
                <el-form-item label="Цена">
                  <el-input v-model="item.price" placeholder="Введите цену" type="number" />
                </el-form-item>
                
                <el-form-item label="Брокер">
                  <FormItemSelect v-if="brokersList.length > 0" v-model="item.broker" :options="brokersList" valueKey="name" labelKey="name" />
                </el-form-item>
                
                <el-form-item label="Статус резиденции">
                  <el-select v-model="item.status" placeholder="Выберите статус">
                    <el-option v-for="(status, idx) in statusesArray" :key="idx" :label="status" :value="status" />
                  </el-select>
                </el-form-item>
              
              </el-form>
              <el-button type="danger" @click="removeOffer(index)" style="margin-top: 10px; width: 30%;" plain>
                <el-icon style="margin-right: 10px;"><Delete /></el-icon>
                Удалить оффер
              </el-button>
            </el-card>
          </div>

          <!-- загрузка изменений объекта лида и usersStats -->
          <div v-if="leadUpdatedLoading">
            <el-skeleton :rows="4"></el-skeleton>
          </div>
    
          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <el-button :loading="leadUpdatedLoading" type="warning" @click="addNewOfferObject" :disabled="!isLeadOffersEdit">+ оффер</el-button>
            <el-button :loading="leadUpdatedLoading" type="success" @click="saveChangesLeadOffers" :disabled="!isLeadOffersEdit">Сохранить</el-button>
          </div>
        </div>
      </div>
    </el-dialog>


    <el-dialog title="Создание системного лида" v-model="isShowModalCreateLead" width="500px">
      <el-form :model="newLeadsObject" label-width="120px">
        <el-form-item label="Дата" prop="date">
          <el-input v-model="newLeadsObject.date" type="date"></el-input>
        </el-form-item>
        <el-form-item label="Брокер" prop="broker">
          <!-- <el-input v-model="newLeadsObject.broker"></el-input> -->
          <FormItemSelect v-if="brokersList.length > 0" v-model="newLeadsObject.broker" labelKey="name" valueKey="name" :options="brokersList" />
        </el-form-item>
        <el-form-item label="Цена офера" prop="price">
          <el-input v-model="newLeadsObject.price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="Телефон" prop="phone">
          <el-input v-model="newLeadsObject.phone"></el-input>
        </el-form-item>
        <el-form-item label="Статус ОКК" prop="statusOKK">
          <el-select v-model="newLeadsObject.statusOKK">
            <el-option :value="true" :label="'Целевой'" />
            <el-option :value="false" :label="'Нецелевой'" />
          </el-select>
        </el-form-item>
        <el-form-item label="сам перевел ?" prop="selfLead">
          <el-select v-model="newLeadsObject.selfLead">
            <!-- <el-option :value="true" :label="'Сам'" />
            <el-option :value="false" :label="'На брокера'" /> -->
            <el-option v-for="item in selfLeadsOptions" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="резиденция" prop="residenceStatus">
          <el-select v-model="newLeadsObject.residenceStatus" placeholder="Выбрать статус">
            <el-option v-for="status in statusesArray" :label="status" :value="status" :key="status"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Кол-во холдов" prop="countHold">
          <el-input v-model="newLeadsObject.countHold"></el-input>
        </el-form-item>
        <el-form-item label="Лидоруб" prop="UserName">
          <FormItemSelect v-if="usersList.length > 0" v-model="newLeadsObject.userName" :options="usersList" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowModalCreateLead = false">Отмена</el-button>
        <el-button type="primary" @click="createHandSytemLead">Сохранить</el-button>
      </div>
    </el-dialog>

</template>
  

<style>

.custom {
    width: 80px;
    text-align: center;
    font-size: 14px;
    text-align: center;
    color: white;
    border-radius: 30px;
    padding-top: 3px;
    padding-bottom: 3px;
    margin-left: -10px;
}

</style>

<script>
  import dayjs from 'dayjs'
  import axios from 'axios'
  import Pagination from '../components/Pagination.vue'

  import FormItemSelect from '../components/FormItemSelect.vue'
  import { ElMessage } from 'element-plus';
  import { Plus, Delete } from '@element-plus/icons-vue'

  
  export default {
    data() {
      return {
        activeTab: 'leads', // активная вкладка
        gte: dayjs(new Date()).format('YYYY-MM-DD'),
        lte: dayjs(new Date()).format('YYYY-MM-DD'),
        leadsTableData: [],
        usersTransfersData: [],
        currentData: [],
        rowsInPage: 25,
        statusesArray: ['hold', 'confirmed', 'refused', 'invalid', 'breaked', 'created'],
        usersArray: [],
        selectedStatuses: null,
        selectedUsers: null,

        // TODO: тут потом тоже разбит ьв 1 обхект filters все для фильтра selected и тд
        filterOkk: null,
        filterUnique: null,

        isShowModalCreateLead: false,
        isShowModalLeadInfo: false,
        newLeadsObject: {
          date: dayjs().format('YYYY-MM-DD'),
          broker: 'Володя Банкир',
          price: 0,
          phone: '',
          audioArray: [],
          residenceStatus: 'created',
          statusOKK: false,
          selfLead: false,
          userName: '',
          countHold: 0,
        },
        isShowLeadObjectToModal: null,
        usersList: [],
        userObject: null,
        rankName: null,
        selfLeadsOptions: ['Сам', 'На брокера', 'Ручной'],
        isLeadOffersEdit: false,
        leadUpdatedLoading: false
      }
    },
    components: {
      Pagination,
      FormItemSelect,
      Plus,
      Delete
    },
    computed: {
      handCurrentLeads() {
        let onlyHandLeads = this.leadsTableData.filter((lead) => {
          return lead.selfLeadName === 'Ручной'
        })
        return onlyHandLeads
      },
      brokersList() {
        return this.$store.getters['getBrokersList']
      }
    },
    methods: {
      addNewOfferObject() {
        this.isShowLeadObjectToModal.offersList.push({
          offerName: 'ЖК альфа',
          price: 10000,
          broker: this.brokersList[0].name,
          status: 'hold'
        })
        console.log(this.brokersList)
      },
      renderPhoneNumber(phone) {
        let splicedPhone = phone.slice(-6)
        let renderedPhone = this.rankName === 'admin' ? phone : splicedPhone
        return renderedPhone
      },
      removeOffer(index) {
        this.isShowLeadObjectToModal.offersList.splice(index, 1)
      },
      async saveChangesLeadOffers() {
        try {

          this.leadUpdatedLoading = true

          let response = await this.$store.dispatch('createDataList', {
            col: 'api/leads/offers/edit',
            data: {
              leadObject: this.isShowLeadObjectToModal
            }
          })

          ElMessage({
            message: 'Лид успешно обновлен',
            type: 'success',
          })

          this.leadUpdatedLoading = false

          this.isShowModalLeadInfo = false

          await this.fetchLeads()

        } catch (e) {
          console.log(e.message)

          ElMessage({
            message: `ошибка при обнолвение оферов лида ${e.message}`,
            type: 'error',
          })
        }
      },
      handleTabClick(tab) {
        if (tab.name === 'leads') {
            this.fetchLeads()
        } else if (tab.name === 'another') {
            this.fetchLeads()
        }
      },
      async deleteLead(lead) {
        try { 
          let response = await this.$store.dispatch('createDataList', {
            col: 'api/leads/delete',
            data: {
              leadId: lead._id
            }
          })

          ElMessage({
            message: 'Лид успешно Удален',
            type: 'success',
          });

          await this.fetchLeads()

        } catch (e) {
          console.log(e.message)
          ElMessage({
            message: `ошибка при удаление лида ${e.message}`,
            type: 'error',
          });
        }
      },
      downloadLeads() {
        const phones = this.leadsTableData.map(item => item.phone).join('\n')
        const blob = new Blob([phones], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')

        a.href = url
        a.download = 'phones.txt'
        document.body.appendChild(a)
        a.click()

        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },
      openInfoModalLead(lead) {
        this.isShowLeadObjectToModal = lead
        this.isShowModalLeadInfo = true
      },
      async fetchLeads() {
        const params = {
          gte: this.gte,
          lte: this.lte,
          statuses: this.selectedStatuses,
          statusOKK: this.filterOkk,
          isUnique: this.filterUnique,
          users: this.selectedUsers
        };
  
        const response = await this.$store.dispatch('getDataList', {
          col: 'api/leads/get',
          params: params
        })
  
        this.leadsTableData = response.leads
        this.updateCurrentData(1, this.rowsInPage)
      },
      async fetchAllUsers() {
        try {
          const response = await this.$store.dispatch('getDataList', { col: 'api/users/getList' })
          this.usersList = response.data.map(user => ({
            value: user.name,
            label: user.name
          }));
        } catch (e) {
          console.log(e.message)
        }
      },
      async createHandSytemLead() {
        try {

          this.newLeadsObject.phone = this.newLeadsObject.phone.replace(/\D/g, '')

          const response = await this.$store.dispatch('createDataList', {
            col: 'api/leads/create',
            data: {
              leadObject: this.newLeadsObject
            }
          })

          ElMessage({
            message: 'Лид успешно Создан',
            type: 'success',
          });

        } catch (e) {
          console.log(e.message)
          ElMessage({
            message: `Ошибка при создании лида ${e.message}`,
            type: 'error',
            });
        }
      },
      async getUsersList() {
        let response = await this.$store.dispatch('getDataList', {
            col: 'api/users/getList'
        })
        this.usersArray = response.data
      },
      getTypeOfBadge(status) {
        let type

        if (status === 'hold') {
          type = 'rgb(44, 157, 44)'
        } else if (status === 'created') {
          type = 'rgb(158, 158, 158)'
        } else if (status === 'invalid') {
          type = 'rgb(248, 104, 188)'
          } else if (status === 'breaked') {
          type = 'rgb(104, 200, 248)'
        } else if (status === 'confirmed') {
          type = 'rgb(253, 191, 76)'
        } else if (status === 'refused') {
          type = 'rgb(190, 116, 247)'
        }

        return type
      },
      handlePageChange({ page, rowsInPage }) {
        this.rowsInPage = rowsInPage
        this.updateCurrentData(page, rowsInPage)
      },
      updateCurrentData(page, rowsInPage) {
        const start = (page - 1) * rowsInPage
        this.currentData = this.leadsTableData.slice(start, start + rowsInPage)
      },
      async resetFilters() {
        this.selectedStatuses = null
        this.selectedUsers = null
        this.filterOkk = null
        this.filterUnique = null
        this.gte = dayjs().format('YYYY-MM-DD')
        this.lte = dayjs().format('YYYY-MM-DD')
        await this.fetchLeads()
      }
    },
    async beforeMount() {
      await this.getUsersList()
      await this.fetchAllUsers()

      this.userObject = this.$store.getters['getUserObject']
      this.rankName = this.userObject?.rankName ?? null
    }
  }
</script>
  
<style>
  .form-filter {
    width: 40% !important;
  }
  .table-data {
    margin-top: 30px;
  }
</style>