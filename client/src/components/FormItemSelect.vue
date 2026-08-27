<template>
    <el-select
      v-model="innerValue"
      filterable
      :multiple="multipleMode"
      :placeholder="placeholder"
      @filter-method="filterMethod"
      @change="handleChange"
      style="width: 100%"
    >
      <el-option
        v-for="item in filteredOptions"
        :key="item[valueKey]"
        :label="item[labelKey]"
        :value="item[valueKey]"
      />
    </el-select>
  </template>
  
  <script>
  export default {
    name: 'FormItemSelect',
    props: {
      modelValue: {
        type: [String, Number],
        default: ''
      },
      options: {
        type: Array,
        required: true
      },
      placeholder: {
        type: String,
        default: 'Выберите...'
      },
      valueKey: {
        type: String,
        default: 'value'
      },
      labelKey: {
        type: String,
        default: 'label'
      },
      multipleMode: {
        type: Boolean,
        default: false
      }
    },
    emits: ['update:modelValue'],
    data() {
      return {
        filteredOptions: [],
        innerValue: this.modelValue
      };
    },
    watch: {
      options: {
        immediate: true,
        handler(newOptions) {
          this.filteredOptions = newOptions;
        }
      },
      modelValue(val) {
        this.innerValue = val;
      }
    },
    methods: {
      filterMethod(query) {
        if (!query) {
          this.filteredOptions = this.options;
          return;
        }
        const lowerQuery = query.toLowerCase();
        this.filteredOptions = this.options.filter(item =>
          String(item[this.labelKey]).toLowerCase().includes(lowerQuery)
        );
      },
      handleChange(val) {
        this.$emit('update:modelValue', val);
      }
    }
  };
  </script>