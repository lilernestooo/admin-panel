<?php
require_once __DIR__ . '/../../middleware/bootstrap.php';
require_once __DIR__ . '/../../config/audit.php';

requireAdmin($pdo);
$requesterUserid = $_SESSION['userid'];

if (empty($data['dealerid']) || empty($data['dealername'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Dealer ID and Dealer Name are required"]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO tbl_dealership (
            dealerid, dealername, daily_svrappt, dlrCalendar, ch_activated,
            dealercode, assigned_ga, assigned_soamed, bm_address, brandid,
            crm2_group_Lvl1, vieworder, dealergroup, host_name, websites,
            crm_address, img_file, lvsms_dealername, vtiger_dealername,
            sales_no, trunk_no, fax_no, cs_appnt, service_no, crm_no,
            active_dealer, date_closed, crm3_group_Lvl1, dealer_street,
            dealer_city, dealer_facade, responseTime, servis2code,
            ch_tbl_name, eric6_api, festtype, FB_Ad_DealerID, cc_assignment
        ) VALUES (
            :dealerid, :dealername, :daily_svrappt, :dlrCalendar, :ch_activated,
            :dealercode, :assigned_ga, :assigned_soamed, :bm_address, :brandid,
            :crm2_group_Lvl1, :vieworder, :dealergroup, :host_name, :websites,
            :crm_address, :img_file, :lvsms_dealername, :vtiger_dealername,
            :sales_no, :trunk_no, :fax_no, :cs_appnt, :service_no, :crm_no,
            :active_dealer, :date_closed, :crm3_group_Lvl1, :dealer_street,
            :dealer_city, :dealer_facade, :responseTime, :servis2code,
            :ch_tbl_name, :eric6_api, :festtype, :FB_Ad_DealerID, :cc_assignment
        )
    ");

    $stmt->execute([
        ':dealerid'          => $data['dealerid'],
        ':dealername'        => $data['dealername'],
        ':daily_svrappt'     => $data['daily_svrappt'] ?? 'N',
        ':dlrCalendar'       => $data['dlrCalendar'] ?? 'N',
        ':ch_activated'      => $data['ch_activated'] ?? null,
        ':dealercode'        => $data['dealercode'] ?? null,
        ':assigned_ga'       => $data['assigned_ga'] ?? null,
        ':assigned_soamed'   => $data['assigned_soamed'] ?? null,
        ':bm_address'        => $data['bm_address'] ?? null,
        ':brandid'           => $data['brandid'] ?? null,
        ':crm2_group_Lvl1'   => $data['crm2_group_Lvl1'] ?? null,
        ':vieworder'         => $data['vieworder'] ?? null,
        ':dealergroup'       => $data['dealergroup'] ?? null,
        ':host_name'         => $data['host_name'] ?? null,
        ':websites'          => $data['websites'] ?? null,
        ':crm_address'       => $data['crm_address'] ?? null,
        ':img_file'          => $data['img_file'] ?? null,
        ':lvsms_dealername'  => $data['lvsms_dealername'] ?? null,
        ':vtiger_dealername' => $data['vtiger_dealername'] ?? null,
        ':sales_no'          => $data['sales_no'] ?? null,
        ':trunk_no'          => $data['trunk_no'] ?? null,
        ':fax_no'            => $data['fax_no'] ?? null,
        ':cs_appnt'          => $data['cs_appnt'] ?? null,
        ':service_no'        => $data['service_no'] ?? null,
        ':crm_no'            => $data['crm_no'] ?? null,
        ':active_dealer'     => $data['active_dealer'] ?? 'Y',
        ':date_closed'       => $data['date_closed'] ?? null,
        ':crm3_group_Lvl1'   => $data['crm3_group_Lvl1'] ?? null,
        ':dealer_street'     => $data['dealer_street'] ?? null,
        ':dealer_city'       => $data['dealer_city'] ?? null,
        ':dealer_facade'     => $data['dealer_facade'] ?? null,
        ':responseTime'      => $data['responseTime'] ?? 'N',
        ':servis2code'       => $data['servis2code'] ?? null,
        ':ch_tbl_name'       => $data['ch_tbl_name'] ?? null,
        ':eric6_api'         => $data['eric6_api'] ?? 'N',
        ':festtype'          => $data['festtype'] ?? 'CarsTruck',
        ':FB_Ad_DealerID'    => $data['FB_Ad_DealerID'] ?? null,
        ':cc_assignment'     => $data['cc_assignment'] ?? 'Carworld',
    ]);

    logAudit($pdo, 'CREATE', $requesterUserid, $data['dealerid'], $data['dealername']);

    echo json_encode([
        "success" => true,
        "message" => "Dealer added successfully",
        "rec_id" => $pdo->lastInsertId(),
    ]);
} catch (PDOException $e) {
    error_log("Save dealer error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Something went wrong. Please try again."]);
}