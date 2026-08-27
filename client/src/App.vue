<template>
  <el-container class="main-menu">
    <el-aside :width="isShowMenu ? fullSidebarWidth : miniSizeSidebar" v-if="showSidebar && !isLoading" style="height: 100%; background-color: #2d2d2d;">
      <el-menu default-active="1" background-color="transparent" text-color="#fff" active-text-color="#ffd04b" router style="height: 100%; display: flex; flex-direction: column; justify-content: flex-start;">

        <el-menu-item style="display: flex; justify-content: space-between;">

          <div style="display: flex; align-items: center;">
            <img src="https://m-files.cdnvideo.ru/lpfile/1/7/1/17132b3c0df3b9802560ee27788e85d5/-/crop/0x0x640x640/-/resize/94/-/resize/1920/f.png" class="logo" />
            <span v-if="isShowMenu" style="text-align: center; color: white; margin-left: 10px;">HBA Лидорубы</span>
          </div>

          <el-button v-if="isShowMenu && isMobile" @click="isShowMenu =! isShowMenu" type="warning" circle>
            <el-icon>
              <ArrowDown />
            </el-icon>
          </el-button>

        </el-menu-item>

        <template v-for="(item, index) in menuItems" :key="index">
          <el-tooltip :content="item.label" :disabled="isShowMenu" placement="right">
            <el-menu-item v-if="!item.condition || item.condition()" :index="item.path" :to="item.path">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span v-if="isShowMenu">{{ item.label }}</span>
            </el-menu-item>
          </el-tooltip>
        </template>

      </el-menu>
    </el-aside>

    <el-main :class="{ 'dark': isDark }" style="height: 100%;" v-if="showNotMobileFull">
      <AppHeader v-if="showSidebar" @updateTheme="updateTheme" :userRole="rankName" :userName="userName" :offersList="activeOffersArr" :onClickMenu="collapse" />
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<style>

.el-header {
  background-color: var(--background-color);
  color: var(--text-color);
}

.collapse-btn {
  margin-top: auto;
  margin-bottom: 20px;
  background-color: rgb(26, 25, 25) !important;
  width: 30px !important;
  margin-left: calc(50% - 15px);
}

.collapse-btn:hover {
  background-color: rgb(49, 48, 48);
}

.main-menu {
  height: 100vh; 
  display: flex;
  align-items: start;
}

.logo {
  width: 30px;
  height: 30px;
  text-align: center;
}

</style>

<script>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { User, House, Avatar, Service, Star, View, Money, Phone, ArrowRight, ArrowDown, Menu, List, Coin } from '@element-plus/icons-vue'
import AppHeader from './components/AppHeader.vue'

export default {
  data() {
    return {
      userObject: null,
      userName: '',
      rankName: '',
      route: null,
      menuItems: [],
      isLoading: true,
      isMobile: true,
      isShowMenu: false, // переменая для коллапса сайдбара
      activeOffersArr: null,
      isDark: false
    }
  },
  components: {
    ArrowDown,
    ArrowRight,
    Menu,
    User,
    AppHeader,
    List
  },
  computed: {
    showSidebar() {
      return this.route.path !== '/login'
    },
    // ширина открытого развернутого сайдбара
    fullSidebarWidth() {
      return this.isMobile ? '100%' : '200px'
    },
    // ширина свернутого меню (мини версия для мобилки : десктоп)
    miniSizeSidebar() {
      return this.isMobile ? '0px' : '60px'
    },
    showNotMobileFull() {
      let isShow = true
      if (this.isMobile === true) {
        isShow = this.isShowMenu ? false : true
      }
      return isShow
    }
  },
  methods: {
    initializeMenu() {
      this.menuItems = [
        {
          label: 'Главная',
          path: '/',
          icon: House,
          condition: null,
        },
        {
          label: 'Лиды',
          path: '/leads',
          icon: Service,
          // condition: () => this.rankName === 'admin',
          condition: null,
        },
        {
          label: 'Пользователи',
          path: '/users',
          icon: View,
          condition: () => this.rankName === 'admin',
        },
        {
          label: 'Зарплатная',
          path: '/salary',
          icon: Money,
          condition: null,
        },
        {
          label: 'ОКК',
          path: '/okk',
          icon: Star,
          condition: () => this.rankName === 'admin',
        },
        {
          label: 'Трансферы',
          path: '/transfers',
          icon: List,
          condition: () => this.rankName === 'admin'
        },
        {
          label: 'Бонусы',
          path: '/bonuses',
          icon: Coin,
          condition: () => this.rankName === 'admin'
        }
        // {
        //   label: 'Сверка',
        //   path: '/phones',
        //   icon: Phone,
        //   condition: () => this.rankName === 'admin'
        // }
      ]
    },
    updateTheme() {
      this.isDark = !this.isDark;
      if (this.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    async fetchResidenceOffers() {
      try {
        const response = await this.$store.dispatch('getDataList', {
          col: 'api/residence/offersList',
          params: {}
        })
        this.activeOffersArr = response.data
      } catch (e) {
        console.log(e.message)
      }
    },
    collapse() {
      this.isShowMenu =! this.isShowMenu
    }
  },
  async beforeMount() {
    this.route = this.$router.currentRoute
    this.userObject = this.$store.getters['getUserObject']
    this.rankName = this.userObject?.rankName ?? null
    this.userName = this.userObject?.name ?? null
    this.initializeMenu()
    console.log(this.userObject)
    this.isLoading = false

    this.fetchResidenceOffers()

    this.isMobile = window.innerWidth < 480 ? true : false

  }
}
</script>