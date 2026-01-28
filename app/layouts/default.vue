<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Header 导航栏 - 使用 NuxtUI 的 UHeader -->
    <UHeader class="sticky top-0 z-50 border-b">
      <template #left>
        <BaseNav />
      </template>
    </UHeader>

    <!-- 主要内容 -->
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer - 使用 NuxtUI 样式 -->
    <UFooter class="mt-auto border-t">
      <template #top>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- 关于我们 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">关于我们</h3>
              <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <NuxtLink to="/about" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    公司简介
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/contact" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    联系我们
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- 客户服务 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">客户服务</h3>
              <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <NuxtLink to="/shipping" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    配送信息
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/returns" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    退换货政策
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/faq" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    常见问题
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- 法律信息 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">法律信息</h3>
              <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <NuxtLink to="/terms" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    服务条款
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/privacy" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    隐私政策
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- 关注我们 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">关注我们</h3>
              <div class="flex space-x-4">
                <UButton
                  to="#"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-simple-icons-facebook"
                  aria-label="Facebook"
                />
                <UButton
                  to="#"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-simple-icons-twitter"
                  aria-label="Twitter"
                />
                <UButton
                  to="#"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-simple-icons-instagram"
                  aria-label="Instagram"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #bottom>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; {{ new Date().getFullYear() }} 版权所有. 保留所有权利.</p>
          </div>
        </div>
      </template>
    </UFooter>
  </div>
</template>
