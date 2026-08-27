<template>
    <el-container inline>
      <p>Всего записей: {{ countRows }}</p>
      <div style="display: flex; align-items: center; gap: 10px;">
        <el-button
          circle
          :disabled="currentPage === 1"
          @click="goToPreviousPage"
          style="border: none;"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
  
        <span>Страница {{ currentPage }} из {{ totalPages }}</span>
  
        <el-button
          circle
          :disabled="currentPage === totalPages"
          @click="goToNextPage"
          style="border: none;"
        >
          <el-icon><ArrowRight /></el-icon>
        </el-button>
  
        <el-select
          v-model.number="localRowsInPage"
          style="margin-left: 20px; width: 100px;"
          @change="onRowsInPageChange"
        >
          <el-option
            v-for="option in rowsInPageArray"
            :key="option"
            :label="option"
            :value="option"
          />
        </el-select>
      </div>
    </el-container>
  </template>
  
  <script>
  import { ElButton, ElSelect, ElOption } from 'element-plus'
  import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
  
  export default {
    name: 'Pagination',
    components: { ElButton, ElSelect, ElOption, ArrowLeft, ArrowRight },
    props: {
      tableData: Array,
      modelValue: {
        type: Number,
        default: 25
      }
    },
    emits: ['update:modelValue', 'page-change'],
    data() {
      return {
        currentPage: 1,
        rowsInPageArray: [5, 10, 25, 50, 100],
        localRowsInPage: this.modelValue
      }
    },
    computed: {
      countRows() {
        return this.tableData.length
      },
      totalPages() {
        return Math.ceil(this.countRows / this.localRowsInPage) || 1
      }
    },
    watch: {
      modelValue(val) {
        this.localRowsInPage = val
      }
    },
    methods: {
      goToPreviousPage() {
        if (this.currentPage > 1) {
          this.currentPage--
          this.emitPageChange()
        }
      },
      goToNextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++
          this.emitPageChange()
        }
      },
      onRowsInPageChange() {
        this.currentPage = 1
        this.$emit('update:modelValue', this.localRowsInPage)
        this.emitPageChange()
      },
      emitPageChange() {
        this.$emit('page-change', {
          page: this.currentPage,
          rowsInPage: this.localRowsInPage
        })
      }
    },
  }
  </script>