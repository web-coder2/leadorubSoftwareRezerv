<template>
    <div class="navbar">
        <div class="navbar-collapse">
            <el-button @click="onClickMenu" circle>
                <el-icon>
                    <Menu />
                </el-icon>
            </el-button>
            <el-button type="warning" plain @click="isShowModalOffers =! isShowModalOffers">активные регионы</el-button>
        </div>
        
        <div>
            <el-switch v-model="isDark" @change="onThemeChange" active-text="dark" inactive-text="light" style="margin-right: 30px;"></el-switch>
            <el-dropdown placement="bottom-end" trigger="click">
                <div>
                    <div>
                        <el-button>
                            <el-icon style="vertical-align: middle" :size="20">
                                <User />
                            </el-icon>
                            <span>{{ userName || 'user' }}</span>
                        </el-button>
                    </div>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="userView" :icon="iconUser">Профиль</el-dropdown-item>
                        <el-dropdown-item @click="logout" :icon="iconClose">Выйти</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>

    <el-dialog title="Список активных регионов" v-model="isShowModalOffers" width="500px">
        <div v-for="(offer, idx) in offersList" :key="idx" style="display: flex; margin-bottom: 10px; justify-content: space-between;">
            <span>{{ offer.region }}</span>
            <el-badge :value="offer.countOffers" :type="getColorType(offer.countOffers)"></el-badge>
        </div>
    </el-dialog>

</template>


<style>
.navbar {
    height: 20px;
    padding-bottom: 20px;
    color: white;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid rgb(194, 194, 194);
    margin-bottom: 30px;
}
  
.navbar-collapse {
    margin-top: -5px;
}

.offers-container {
    display: flex;
    text-wrap: wrap;
    color: black;
    font-size: 10px;
}

</style>


<script>

    import { User, Menu, ArrowRight } from '@element-plus/icons-vue'


    export default {
        data() {
            return {
                title: 'appLayout',
                isShowModalOffers: false,
                isDark: false
            }
        },
        components: {
            User,
            Menu,
            ArrowRight,
        },
        props: {
            userName: {
                type: String,
                required: false,
            },
            onClickMenu: {
                type: Function
            },
            offersList: {
                type: Array,
                required: false,
                default: null
            },
            updateTheme: {
                type: Function
            }
        },
        methods: {
            userView() {
                this.$router.push('/profile')
            },
            logout() {
                this.$router.push('/login')
            },
            getColorType(count) {
                if (count >= 10) {
                    return 'success'
                } else if (count > 5 && count < 10) {
                    return 'warning'
                } else if (count <= 5) {
                    return 'danger'
                }
            },
            onThemeChange(val) {
                this.$emit('update-theme', val)
            }
        }
    }

</script>