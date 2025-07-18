import { computed, ref, onUnmounted } from 'vue'
import dayjs from 'dayjs'

export const useCountDown = () => {
    let timer = null
    const time = ref(0)
    const currentTime = ref(0)
    const formatTime = computed(() => dayjs.unix(time.value).format('00:mm:ss'))

    const timeStart = (duration) => {
        time.value = duration
        timer = setInterval(() => {
            time.value--
            currentTime.value = time.value
            if (time.value <= 0) {
                timer && clearInterval(timer)
            }
        }, 1000)
    }

    const timeStop = () => {
        timer && clearInterval(timer)
    }

    onUnmounted(() => {
        timer && clearInterval(timer)
    })
    return {
        currentTime,
        formatTime,
        timeStart,
        timeStop
    }
}
