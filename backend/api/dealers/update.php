<?php
require_once __DIR__ . '/../../middleware/bootstrap.php';
require_once __DIR__ . '/../../config/audit.php';

requireAdmin($pdo);
$requesterUserid = $_SESSION['userid'];

if (empty($data['rec_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "rec_id is required"]);
    exit();
}

try {
    // Capture identity before updating, for the audit log
    $existing = $pdo->prepare("SELECT dealerid, dealername FROM tbl_dealership WHERE rec_id = ?");
    $existing->execute([$data['rec_id']]);
    $existingDealer = $existing->fetch();

    $stmt = $pdo->prepare("
        UPDATE tbl_dealership SET
            dealerid = :dealerid,
            dealername = :dealername,
            daily_svrappt = :daily_svrappt,
            dlrCalendar = :dlrCalendar,
            ch_activated = :ch_activated,
            dealercode = :dealercode,
            assigned_ga = :assigned_ga,
            assigned_soamed = :assigned_soamed,
            bm_address = :bm_address,
            brandid = :brandid,
            crm2_group_Lvl1 = :crm2_group_Lvl1,
            vieworder = :vieworder,
            dealergroup = :dealergroup,
            host_name = :host_name,
            websites = :websites,
            crm_address = :crm_address,
            img_file = :img_file,
            lvsms_dealername = :lvsms_dealername,
            vtiger_dealername = :vtiger_dealername,
            sales_no = :sales_no,
            trunk_no = :trunk_no,
            fax_no = :fax_no,
            cs_appnt = :cs_appnt,
            service_no = :service_no,
            crm_no = :crm_no,
            active_dealer = :active_dealer,
            date_closed = :date_closed,
            crm3_group_Lvl1 = :crm3_group_Lvl1,
            dealer_street = :dealer_street,
            dealer_city = :dealer_city,
            dealer_facade = :dealer_facade,
            responseTime = :responseTime,
            servis2code = :servis2code,
            ch_tbl_name = :ch_tbl_name,
            eric6_api = :eric6_api,
            festtype = :festtype,
            FB_Ad_DealerID = :FB_Ad_DealerID,
            cc_assignment = :cc_assignment
        WHERE rec_id = :id
    ");

    $stmt->execute([
        ':dealerid'          => $data['dealerid'] ?? null,
        ':dealername'        => $data['dealername'] ?? null,
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
        ':id'                => $data['rec_id'],
    ]);

    logAudit(
        $pdo,
        'UPDATE',
        $requesterUserid,
        $existingDealer['dealerid'] ?? null,
        $existingDealer['dealername'] ?? null
    );

    echo json_encode(["success" => true, "message" => "Dealer updated successfully"]);
} catch (PDOException $e) {
    error_log("Update dealer error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Something went wrong. Please try again."]);
}