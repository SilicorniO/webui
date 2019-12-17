import CallbackTimer from "./CallbackTimer"
import TestUtils from "../../__tests__/TestUtils"

const DELAY = 20

describe("CallbackTimer", () => {
    test("first execution", async () => {
        // variable to change
        let result = 0

        // generate callback
        const callbackTimer = new CallbackTimer(() => {
            result += 1
        }, DELAY)
        callbackTimer.execute()

        // check text
        expect(result).toBe(1)
    })

    test("two executions not waiting", async () => {
        // variable to change
        let result = 0

        // generate callback
        const callbackTimer = new CallbackTimer(() => {
            result += 1
        }, DELAY)
        callbackTimer.execute()
        callbackTimer.execute()

        // check text
        expect(result).toBe(1)
    })

    test("two execution waiting all", async () => {
        // variable to change
        let result = 0

        // generate callback
        const callbackTimer = new CallbackTimer(() => {
            result += 1
        }, DELAY)
        callbackTimer.execute()
        callbackTimer.execute()

        await TestUtils.delay(DELAY * 2)

        // check text
        expect(result).toBe(2)
    })

    test("three execution waiting one delay", async () => {
        // variable to change
        let result = 0

        // generate callback
        const callbackTimer = new CallbackTimer(() => {
            result += 1
        }, DELAY)
        callbackTimer.execute()
        callbackTimer.execute()
        callbackTimer.execute()

        await TestUtils.delay(DELAY * 2)

        // check text
        expect(result).toBe(2)
    })

    test("two executions with own delay", async () => {
        // variable to change
        let result = 0

        // generate callback
        const callbackTimer = new CallbackTimer(() => {
            result += 1
        }, DELAY)
        callbackTimer.execute()
        await TestUtils.delay(DELAY * 2)
        callbackTimer.execute()

        // check text
        expect(result).toBe(2)
    })
})
