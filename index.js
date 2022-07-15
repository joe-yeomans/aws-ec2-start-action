const core = require('@actions/core');
const child_process = require('child_process');

const startInstance = (state, instanceId) => {
    if (state == 'stopping') {
        console.log('Instance is stopping, waiting...');
        setTimeout(() => {
            state = getState(instanceId);
            startInstance(state, instanceId);
        }, 15000);
    } else {
        console.log('Instance is starting...');
        child_process.execSync(`aws ec2 start-instances --instance-ids ${instanceId}`)
    }
}

const getState = (instanceId) => {
    const output = JSON.parse(child_process.execSync(`aws ec2 describe-instances --instance-ids ${instanceId}`).toString());
    const state = output.Reservations[0].Instances[0].State.Name;
    return state;
}

try {
    const instanceId = core.getInput('instance-id');
    const state = getState(instanceId);
    startInstance(state, instanceId);
} catch (error) {
    core.setFailed(error.message);
}