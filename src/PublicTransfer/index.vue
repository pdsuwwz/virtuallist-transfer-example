<template>
  <div class="public-transfer">
    <div class="public-transfer__left">
      <!-- <div
        class="transfer-box-header transparent"
      >
        xxxxx header
      </div> -->
      <div
        class="transfer-box-filter"
      >
        <slot name="filterLeft"></slot>
        <el-input
          v-model.trim="searchValue"
          placeholder="请输入名称/编号"
          clearable
          prefix-icon="el-icon-search"
        />
      </div>
      <div class="transfer-box-body">
        <TransferScroller
          v-slot="{ item }"
          v-model="checkedLeftList"
          :filter-list="filterLeftList"
          :data-list="leftList"
          :key-field="keyField"
        >
          <span
            :title="`${item[keyField]}${item.name}`"
            class="text_nowrap item-code"
          >
            <!-- {{ item[keyField] }} -->
            {{ item.code }}
          </span>
          <span
            :title="`${item[keyField]}${item.name}`"
            class="text_nowrap item-name"
          >
            {{ item.name }}
          </span>
        </TransferScroller>
      </div>
    </div>
    <div class="public-transfer__center">
      <div class="center-action">
        <el-button
          type="primary"
          size="mini"
          :disabled="!checkedLeftList.length"
          @click="handlePushRight()"
        >
          <el-icon>
            <ArrowRightBold />
          </el-icon>
        </el-button>
      </div>
      <div class="center-action">
        <el-button
          type="primary"
          size="mini"
          :disabled="!checkedRightList.length"
          @click="handlePushLeft()"
        >
          <el-icon>
            <ArrowLeftBold />
          </el-icon>
        </el-button>
      </div>
    </div>
    <div class="public-transfer__right">
      <div class="transfer-box-header">
        <span>已选择项目</span>
        <span
          v-if="rightList.length"
          class="sub-desc"
        >
          {{ rightList.length }}个项目
        </span>
      </div>
      <div
        v-if="$slots.filterRight"
        class="transfer-box-filter"
      >
        <slot name="filterRight"></slot>
      </div>
      <div class="transfer-box-body">
        <TransferScroller
          v-slot="{ item }"
          v-model="checkedRightList"
          :data-list="rightList"
          :key-field="keyField"
        >
          <span
            :title="`${item[keyField]}${item.name}`"
            class="text_nowrap item-code"
          >
            <!-- {{ item[keyField] }} -->
            {{ item.code }}
          </span>
          <span
            :title="`${item[keyField]}${item.name}`"
            class="text_nowrap item-name"
          >
            {{ item.name }}
          </span>
        </TransferScroller>
      </div>
    </div>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  ref,
  watch
} from 'vue'
 // TODO: 不用 lodash 而用 lodash-es 的原因在于 lodash-es 可更好的用于 tree-shaking
import { debounce } from 'lodash-es'

import { ArrowRightBold, ArrowLeftBold } from '@element-plus/icons-vue'
import { ElMessage, ElInput, ElIcon, ElButton } from 'element-plus'

import TransferScroller from './TransferScroller.vue'

const getCompanyByIndustry = (companyList = [], keyField) => {
  return companyList.map((item) => {
    const result = {
      ...item
    }
    const id = item.id
    if (id) {
      result[keyField] = id
    }

    return result
  })
}

/**
 * 穿梭框
 */
export default defineComponent({
  name: 'PublicTransfer',
  components: {
    ArrowLeftBold,
    ArrowRightBold,
    TransferScroller,
    ElInput,
    ElIcon,
    ElButton
  },
  props: {
    keyField: {
      type: String,
      default: 'id'
    },
    dataset: {
      type: Array,
      default() {
        return []
      }
    },
    left: {
      type: Array,
      default() {
        return []
      }
    },
    right: {
      type: Array,
      default() {
        return []
      }
    },
    limit: {
      type: Number,
      default: Infinity
    }
  },
  emits: ['update:right', 'search'],
  setup(props, { emit }) {
    const leftList = ref([])
    const rightList = ref([])
    const companyQuery = computed(() => props.dataset)

    watch(
      () => companyQuery.value,
      () => {
        leftList.value = getCompanyByIndustry(companyQuery.value, props.keyField)
      },
      {
        deep: true,
        immediate: true
      }
    )
    watch(
      () => props.right,
      (val) => {
        rightList.value = val
      },
      {
        deep: true,
        immediate: true
      }
    )
    watch(
      () => rightList.value,
      (val) => {
        emit('update:right', rightList.value)
      },
      {
        deep: true,
        immediate: true
      }
    )

    const filterLeftList = computed(() => rightList.value)

    const checkedLeftList = ref([])
    const checkedRightList = ref([])

    const getIndexByChecked = (checkedList, target) => {
      const index = checkedList.value.findIndex(
        (checkedItem) => {
          return checkedItem[props.keyField] === target[props.keyField]
        }
      )
      return index
    }

    /**
     * 1、将左侧选中数据添加到右侧
     * 2、清空左选中
     */
    const handlePushRight = () => {
      if (
        (rightList.value.length + checkedLeftList.value.length) > props.limit
      ) {
        ElMessage({
          type: 'warning',
          message: `最多选择${ props.limit }个！`
        })
        return
      }
      rightList.value.push(...checkedLeftList.value)

      checkedLeftList.value = []
    }

    /**
     * 1、将右侧选中数据移除
     * 2、清空右选中
     */
    const handlePushLeft = () => {
      checkedRightList.value.forEach((checkedItem) => {
        const index = getIndexByChecked(rightList, checkedItem)
        rightList.value.splice(index, 1)
      })

      checkedRightList.value = []
    }

    return {
      leftList,
      rightList,
      filterLeftList,

      checkedLeftList,
      checkedRightList,

      handlePushRight,
      handlePushLeft,

      ...useSearch(emit, leftList, companyQuery, props)
    }
  }
})

const useSearch = (emit, leftList, companyQuery, props) => {
  const searchValue = ref('')
  watch(
    [
      () => searchValue.value
    ],
    debounce(
      () => {
        /**
         * 接口 API 模糊搜索
         */

        /**
         * 因实际生产环境电脑配置较低，所以此本地搜索方式暂时废弃，改为接口 API 模糊搜索
         */
        // emit('search', searchValue.value)

        const allList = getCompanyByIndustry(companyQuery.value, props.keyField)
        if (!searchValue.value) {
          leftList.value = allList
          return
        }

        // 1、代码
        if (!isNaN(Number(searchValue.value))) {
          leftList.value = allList.filter((item) => {
            return item[props.keyField].includes(searchValue.value) || searchValue.value.includes(item[props.keyField])
          })
        } else {
          // 2、名称、拼音
          /^[a-zA-Z]+$/.test(searchValue.value)
          leftList.value = allList.filter((item) => {
            return item.name.toUpperCase().includes(searchValue.value.toUpperCase()) ||
             searchValue.value.toUpperCase().includes(item.name.toUpperCase())
          })
        }
      },
      300
    )
  )
  return {
    searchValue
  }
}
</script>

<style lang="scss" scoped>
.public-transfer {
  display: flex;
  width: 100%;
  height: 380px;
  background: #fff;
  font-family: PingFangSC-Regular, PingFang SC;
  .public-transfer__center {
    width: 100px;
    .center-action {
      margin-bottom: 22px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    &:deep() {
      .el-button {
        width: 56px;
        font-size: 18px;
        padding-top: 4px;
        padding-bottom: 4px;
      }
      .el-button.is-disabled {
        background-color: #f0f2f6;
        border-color: #dcdfe6;
        color: #909399;
      }
    }
  }
  .public-transfer__left,
  .public-transfer__center,
  .public-transfer__right {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .public-transfer__left,
  .public-transfer__right {
    flex: 1;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }
  .transfer-box-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 44px;
    padding: 0 16px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    background: #f6f7f9;
    border-radius: 4px 4px 0px 0px;
    border-bottom: 1px solid #dcdfe6;
    &.transparent {
      background: transparent;
      border-bottom: transparent;
      padding-top: 5px;
    }
    .sub-desc {
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
  }
  .transfer-box-filter {
    width: 100%;
    padding: 8px 16px 12px;
    border-bottom: 1px solid #dcdfe6;
  }
  .transfer-box-body {
    width: 100%;
    flex: 1;
    min-height: 0;
    .item-code {
      width: 100px;
    }
    .item-name {
      flex: 1;
      min-width: 0;
      margin-left: 20px;
    }
  }
}
</style>
