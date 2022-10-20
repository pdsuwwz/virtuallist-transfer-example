<template>
  <RecycleScroller
    v-slot="{ item }"
    class="transfer-scroller"
    :items="items"
    :item-size="50"
    :key-field="keyField"
  >
    <div
      :key="item[keyField]"
      class="transfer-scroller-row__item"
      :class="{
        checked: getIndexByChecked(checkedList, item) > -1
      }"
      @click="handleChecked(item)"
    >
      <el-checkbox
        :model-value="getIndexByChecked(checkedList, item) > -1"
        class="transfer-scroller-row__item-checkbox"
      />
      <slot v-bind="{ item }"></slot>
    </div>
  </RecycleScroller>
</template>

<script>
import {
  computed,
  defineComponent,
  ref,
  watch
} from 'vue'

import { ElCheckbox } from 'element-plus'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const useChecked = (props, emit) => {
  const checkedList = ref([])
  const getIndexByChecked = (checkedQueue, item) => {
    const index = checkedQueue.findIndex(
      (checkedItem) => {
        return checkedItem[props.keyField] === item[props.keyField]
      }
    )
    return index
  }
  const handleChecked = (item) => {
    const checkedIndex = getIndexByChecked(checkedList.value, item)
    if (checkedIndex > -1) {
      checkedList.value.splice(checkedIndex, 1)
    } else {
      checkedList.value.push(item)
    }
    emit('update:modelValue', checkedList.value)
  }

  const items = computed(() => {
    const result = [...props.dataList].filter((item) => {
      return !(getIndexByChecked(props.filterList, item) > -1)
    })
    result.sort(
      (prev, next) => prev[props.keyField] > next[props.keyField] ? 1 : -1
    )
    return result
  })
  watch(
    () => props.modelValue,
    () => {
      checkedList.value = props.modelValue
    },
    {
      deep: true
    }
  )
  return {
    items,
    checkedList: computed(() => checkedList.value),
    getIndexByChecked,
    handleChecked
  }
}

export default defineComponent({
  name: 'TransferScroller',
  components: {
    ElCheckbox,
    RecycleScroller
  },
  props: {
    modelValue: {
      type: Array,
      default() {
        return []
      }
    },
    keyField: {
      type: String,
      default: 'id'
    },
    filterList: {
      type: Array,
      default() {
        return []
      }
    },
    dataList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  emits: [
    'update:modelValue'
  ],
  setup(props, { emit }) {
    return {
      ...useChecked(props, emit)
    }
  }
})
</script>

<style lang="scss" scoped>
.transfer-scroller {
  user-select: none;
  width: 100%;
  height: 100%;
  font-family: PingFangSC-Regular, PingFang SC;
  .transfer-scroller-row__item {
    display: flex;
    align-items: center;
    height: 46px;
    padding: 0 16px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    cursor: pointer;
    transition: backgroundColor .3s;
    &:hover {
      background-color: rgba(#eee, 0.3);
    }
    .transfer-scroller-row__item-checkbox {
      margin-right: 12px;
      pointer-events: none;
    }
    &.checked {
      color: #517ecf;
    }
    .transfer-scroller-row__item-content {

    }
  }
}
</style>
