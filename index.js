const core = require('@actions/core');
const child_process = require('child_process');

const getState = (instanceId) => {
    const output = JSON.parse(child_process.execSync(`aws ec2 describe-instances --instance-ids ${instanceId}`).toString());
    const state = output.Reservations[0].Instances[0].State.Name;
    return state;
}

const startInstance = (state, instanceId) => {
    console.log(`Instance ${instanceId} is ${state}`);
    if (state == 'stopping') {
        console.log('Instance is stopping, waiting...');
        setTimeout(() => {
            const newState = getState(instanceId);
            startInstance(newState, instanceId);
        }, 15000);
    } else {
        console.log('Instance is starting...');
        child_process.execSync(`aws ec2 start-instances --instance-ids ${instanceId}`)
    }
}

try {
    const instanceId = core.getInput('instance-id');
    const state = getState(instanceId);
    startInstance(state, instanceId);
} catch (error) {
    core.setFailed(error.message);
}