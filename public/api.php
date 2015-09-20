<?php
require_once realpath(__DIR__.'/../vendor').'/autoload.php';

$service = new \B2k\QlessGui\APIService();
$response = null;

try {
    switch ($_REQUEST['command']) {
        case 'config':
            $response = $service->getConfig();
            break;
        case 'queues':
            $response = $service->getQueues();
            break;
        case 'failed':
            $response = json_encode($service->failedJobs());
            break;
        case 'status':
            $jobState = null;
            if (array_key_exists('jobState', $_REQUEST)) {
                $state = $_REQUEST['jobState'];
                if ($state !== 'undefined' && $state !== 'stats') {
                    $jobState = $state;
                }
            }
            $response = json_encode($service->queueStatus($_REQUEST['queue'], $jobState));
            break;
        case 'tracked':
            $response = json_encode($service->getTracked());
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
        case 'job':
            $response = json_encode($service->getJob($_REQUEST['jid']));
            break;
        default:
            $response = $service->run($_REQUEST['command']);
            break;
    }
} catch(\Exception $e) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
    echo $e->getMessage();
    return '';
}
header('Content-Type: application/json');
echo $response;
