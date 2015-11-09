<?php
namespace B2k\QlessGui;


use Qless\Client;
use Qless\Job;

class APIService
{
    /**
     * @var array
     */
    private $config = [];
    /**
     * @var Client
     */
    private $client;
    /**
     * @var \Redis
     */
    private $redis;

    public function __construct()
    {
        $configPath = realpath(__DIR__.'/../../../').'/config.php';
        if (!file_exists($configPath)) {
            throw new \Exception('Config file missing');
        }
        $this->config = require($configPath);
        $this->client = new Client($this->config['redis']['host'], $this->config['redis']['port']);
        $this->redis = new \Redis();
        $this->redis->connect($this->config['redis']['host'], $this->config['redis']['port']);
    }

    /**
     * Return list of queues in the database
     */
    public function getQueues()
    {
        return $this->client->queues();
    }

    public function queueStatus($queue, $jobState)
    {
        $data = json_decode($this->client->queues($queue), true);
        if ($jobState) {
            if ($jobState === 'waiting') {
                $data['jobs'] = json_decode($this->client->lua->run('peek', [$queue, 25]), true);
            } else {
                $jobs = $this->client->lua->run('jobs', [$jobState, $queue, 0, 25]);
                $data['jobs'] = json_decode($this->client->lua->run('multiget', $jobs), true);
            }
        }
        return array_merge($data, [
            'stats' => json_decode($this->client->getQueue($queue)->stats()),
            'length' => $this->queueLength($queue),
        ]);
    }

    public function getJobs()
    {
        return [
            'completed' => $this->completedJobs(),
            'scheduled' => $this->scheduledJobs(),
            'failed'    => $this->failedJobs(),
        ];
    }

    public function getJob($jid)
    {
        return json_decode($this->client->lua->run('get', [$jid]), true);
    }

    public function completedJobs($start = 0, $count = 25)
    {
        $jobIds = $this->client->jobs('complete', $start, $count);
        return json_decode(call_user_func_array([$this->client, 'multiget'], $jobIds), true);
    }

    public function scheduledJobs($start = 0, $count = 25)
    {
        return $this->client->jobs('scheduled', $start, $count);
    }

    public function failedJobs($type = false, $page = 1)
    {
        $out = [
            'failed' => [],
            'jobs' => [],
        ];
        $types = json_decode($this->client->failed(), true);
        foreach ($types as $name => $count) {
            $out['failed'][] = ['name' => $name, 'count' => $count];
        }

        if (!$type && isset($_REQUEST['type'])) {
            $type = $_REQUEST['type'];
        }
        if ($type) {
            $jobs = json_decode($this->client->failed($type, ($page-1) * 25, $page * 25), true)['jobs'];
            $results = call_user_func_array([$this->client, 'multiget'], $jobs);
            $out['jobs'] = json_decode($results, true);
        }

        return $out;
    }

    public function queueLength($queue)
    {
        return $this->client->getQueue($queue)->length();
    }

    public function workers()
    {
        return json_decode($this->client->lua->run('workers', []), true);
    }

    public function worker($workerName)
    {
        $workerData = json_decode($this->client->lua->run('workers', [$workerName]), true);
        $workerData['name'] = $workerName;
        if (!empty($workerData['jobs'])) {
            $results = call_user_func_array([$this->client, 'multiget'], $workerData['jobs']);
            $workerData['jobs'] = json_decode($results, true);
        }
        if (!empty($workerData['stalled'])) {
            $results = call_user_func_array([$this->client, 'multiget'], $workerData['stalled']);
            $workerData['stalled'] = json_decode($results, true);
        }
        return $workerData;
    }

    public function getConfig()
    {
        return $this->client->{"config.get"}();
    }

    public function run($command)
    {
        switch ($command) {
            case 'track':
            case 'untrack':
                $jid = $_REQUEST['jid'];
                return json_decode($this->client->lua->run('track', [$command, $jid]), true);
            case 'retry':
                return $this->retryJob($_REQUEST['jid']);
            case 'retryAll':
                return $this->retryAllJobs($_REQUEST['group']);
            case 'cancel':
                return $this->client->cancel($_REQUEST['jid']);
            case 'cancelAll':
                return $this->cancelAllJobs($_REQUEST['group']);
            case 'timeout':
                $this->client->timeout($_REQUEST['jid']);
                return true;
            case 'move':
                $this->retryJob($_REQUEST['jid'], $_REQUEST['queue']);
                return true;
            case 'priority':
                $this->client->lua->run('priority', [$_REQUEST['jid'], $_REQUEST['priority']]);
                return true;
            case 'tag':
                $this->client->lua->run('tag', [ 'add', $_REQUEST['jid'], $_REQUEST['tag'] ]);
                return true;
            case 'untag':
                $this->client->lua->run('tag', [ 'remove', $_REQUEST['jid'], $_REQUEST['untag'] ]);
                return true;
        }
        throw new \Exception('Invalid command: '.$command);
    }

    protected function retryAllJobs($group)
    {
        foreach(json_decode($this->client->failed($group, 0, 99), true)['jobs'] as $job) {
            $this->retryJob($job);
        }
        return true;
    }

    protected function cancelAllJobs($group)
    {
        foreach(json_decode($this->client->failed($group, 0, 99), true)['jobs'] as $job) {
            $this->client->cancel($job);
        }
        return true;
    }

    protected function retryJob($jid, $queue = false)
    {
        /** @var Job $job */
        $job = $this->client->getJobs()->get($jid);
        if ($job) {
            $opts = [];
            if ($queue) {
                $opt['queue'] = $queue;
            }
            $job->requeue($opts);
        }
        return $this->client->get($jid);
    }

    public function getTracked()
    {
        $jobs = json_decode($this->client->lua->run('track', []));
        return $jobs;
    }
}
