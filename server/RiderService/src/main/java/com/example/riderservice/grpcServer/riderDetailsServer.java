package com.example.riderservice.grpcServer;

import com.example.grpc.RiderDetailsRequest;
import com.example.grpc.RiderDetailsResponse;
import com.example.grpc.RiderDetailsServiceGrpc;
import com.example.riderservice.model.rider;
import com.example.riderservice.repository.riderRepository;
import com.example.riderservice.service.deliveryService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
@RequiredArgsConstructor
public class riderDetailsServer extends RiderDetailsServiceGrpc.RiderDetailsServiceImplBase {


    private final riderRepository riderRepository;
    private final deliveryService deliveryService;

    @Override
    public void getRiderDetails(
            RiderDetailsRequest request,
            StreamObserver<RiderDetailsResponse> responseObserver
    ){

            String email = request.getRiderEmail();
            System.out.println("Fetching details for rider with email: " + email);

            try{
                rider foundRider = riderRepository.findByEmail(email);

                int deliveryCount = deliveryService.countDeliveriesByRiderEmail(email);

                RiderDetailsResponse response = RiderDetailsResponse.newBuilder()
                        .setRiderName(foundRider.getFirst_name()+ " " + foundRider.getLast_name())
                        .setRiderPhone(foundRider.getPhone_number())
                        .setVehicleNo(foundRider.getVehicle_no())
                        .setDeliveryCount(String.valueOf(deliveryCount))
                        .setRiderImage(foundRider.getImg_url())
                        .setRating(String.valueOf(foundRider.getRating()))
                        .build();

                responseObserver.onNext(response);
                responseObserver.onCompleted();
            }
            catch (Exception e){
                responseObserver.onError(
                        io.grpc.Status.NOT_FOUND
                                .withDescription("Rider not found with email: " + email)
                                .asRuntimeException()
                );
            }
    }



}
