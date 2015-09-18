<?php
require_once realpath(__DIR__.'/../vendor').'/autoload.php';

$service = new \B2k\QlessGui\APIService();
$response = null;

switch ($_REQUEST['command']) {
    case 'config':
        $response = $service->getConfig();
        break;
    case 'queues':
        $response = $service->getQueues();
        break;
    case 'fails':
        $response = json_encode($service->failedJobs());
        break;
    case 'status':
        $response = json_encode($service->queueStatus($_REQUEST['queue']));
        break;
    case 'completed':
        $response = json_encode($service->completedJobs());
        break;
    case 'queueLength':
        $response = $service->queueLength($_REQUEST['queue']);
        break;
    case 'workers':
        $response = json_encode($service->workers());
        break;
    case 'worker':
        $response = json_encode($service->worker($_REQUEST['worker']));
        break;
    case 'jobs':
        $response = json_encode($service->getJobs());
        break;
}

header('Content-Type: application/json');
echo $response;
