export default class TestUtils {
    public static async delay(timeInMillis: number): Promise<void> {
        return await new Promise((resolve, _reject) => {
            setTimeout(resolve, timeInMillis)
        })
    }
}
