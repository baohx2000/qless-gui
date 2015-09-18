<?php
namespace B2k\QlessGui;


use Qless\Client;

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

    public function queueStatus($queue)
    {
        $data = json_decode($this->client->queues($queue), true);
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

    public function completedJobs($start = 0, $count = 25)
    {
        return $this->client->jobs('complete', $start, $count);
    }

    public function scheduledJobs($start = 0, $count = 25)
    {
        return $this->client->jobs('scheduled', $start, $count);
    }

    public function failedJobs($type = false, $page = 1)
    {
        if (!$type) {
            $types = json_decode($this->client->failed(), true);
            $out = [];
            foreach ($types as $name => $count) {
                $out[] = ['name' => $name, 'count' => $count];
            }
            return $out;
        }

        return $this->client->failed($type, 0, 25);
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
}
