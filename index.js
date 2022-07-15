const core = require('@actions/core');
const child_process = require('child_process');

const startInstance = (state) => {
    if (state == 'stopping') {
        console.log('Instance is stopping, waiting...');
        setTimeout(() => {
            state = getState(instanceId);
            startInstance(state);
        }, 15000);
    } else {
        console.log('Instance is stopped.');
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
    startInstance(state);
} catch (error) {
    core.setFailed(error.message);
}