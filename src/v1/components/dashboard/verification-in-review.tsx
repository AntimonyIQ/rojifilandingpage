import { motion } from "framer-motion";
import { Clock, Shield, ArrowRight, Building, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useParams } from "wouter";
import { session, SessionData } from "@/v1/session/session";
import { useEffect, useState } from "react";
import { IDirectorAndShareholder, IResponse, ISender } from "@/v1/interface/interface";
import Defaults from "@/v1/defaults/defaults";
import { Status } from "@/v1/enums/enums";
import { ILoginFormProps } from "../auth/login-form";

export function VerificationInReview() {
  const [sender, setSender] = useState<ISender | null>(null);
  const [_loading, setLoading] = useState<boolean>(true);
  const [directors, setDirectors] = useState<Array<IDirectorAndShareholder>>([]);
  const sd: SessionData = session.getUserData();
  const { wallet } = useParams();

  useEffect(() => {
    if (sd) {
      setSender(sd.sender);
      setDirectors(sd.sender.directors);
    }
  }, [sd]);

  useEffect(() => {
    fetchSenderData();

    const interval = setInterval(() => {
      fetchSenderData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchSenderData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
        method: "GET",
        headers: {
          ...Defaults.HEADERS,
          "x-rojifi-handshake": sd.client.publicKey,
          "x-rojifi-deviceid": sd.deviceid,
          Authorization: `Bearer ${sd.authorization}`,
        },
      });

      const data: IResponse = await res.json();
      if (data.status === Status.ERROR) throw new Error(data.message || data.error);
      if (data.status === Status.SUCCESS) {
        if (!data.handshake)
          throw new Error("Unable to process response right now, please try again.");
        const parseData: ILoginFormProps = Defaults.PARSE_DATA(
          data.data,
          sd.client.privateKey,
          data.handshake
        );

        setSender(parseData.sender);
        setDirectors(parseData.sender.directors || []);

        // Update session with the latest sender data
        session.updateSession({
          ...sd,
          user: parseData.user,
          wallets: parseData.wallets,
          transactions: parseData.transactions,
          sender: parseData.sender,
        });
      }
    } catch (error: any) {
      console.error("Error fetching sender data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatuses = () => {
    if (!sender) return { allVerified: false, hasFailed: false, inReview: false };

    const documents = sender.documents || [];

    if (documents.length === 0) {
      return { allVerified: false, hasFailed: false, inReview: true };
    }

    // Any document with issue === true should mark the whole set as failed
    const hasFailed = documents.some((doc) => doc.issue === true || doc.smileIdStatus === "failed");
    const allVerified = documents.every((doc) => doc.kycVerified === true && doc.issue !== true);
    const inReview = documents.some(
      (doc) => (doc.kycVerified === false || !doc.kycVerified) && doc.issue !== true
    );

    return { allVerified, hasFailed, inReview };
  };

  const { hasFailed } = getDocumentStatuses();

  // Determine if any director/shareholder has an issue according to IDirectorAndShareholder
  const directorHasIssue = (directors || []).some((d: IDirectorAndShareholder | any) => {
    const idDoc = d?.idDocument;
    const poa = d?.proofOfAddress;

    // Consider it an issue when:
    // - the SmileID status for the idDocument is explicitly 'rejected'
    // - the explicit verified flags are false
    // - or one of the required document URLs is missing
    return (
      idDoc?.issue === true ||
      poa?.issue === true ||
      // idDoc?.smileIdStatus === 'rejected' ||
      // d?.idDocumentVerified === false ||
      // d?.proofOfAddressVerified === false ||
      !idDoc?.url ||
      !poa?.url
    );
  });

  const failure = hasFailed || directorHasIssue;

  const handleViewBusinessProfile = () => {
    window.location.href = `/dashboard/${wallet}/businessprofile`;
  };

  return (
    <div className="mt-10 bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border border-gray-200 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-6"
            >
              {failure ? (
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <X className="h-10 w-10 text-white" />
                  {/* Pulsing ring effect - red */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-red-400/60 rounded-full"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <Shield className="h-10 w-10 text-white" />
                  {/* Pulsing ring effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-yellow-400 rounded-full"
                  />
                </div>
              )}
            </motion.div>

            {/* Main Content */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {hasFailed || directorHasIssue
                ? "Action Required: Verification Issues Detected"
                : "Verification in Review"}
            </h1>
            {hasFailed || directorHasIssue ? (
              <p className="text-red-600 mb-6 text-lg leading-relaxed">
                We encountered issues with your submitted documents. Please review your business
                profile to resolve these issues and complete the verification process.
              </p>
            ) : (
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Your business verification is currently being processed. Access to dashboard
                features is temporarily limited while we review your submission.
              </p>
            )}

            {/* Status Info */}
            {!(hasFailed || directorHasIssue) && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-yellow-800">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Review typically takes 1-2 business days</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleViewBusinessProfile}
                size="lg"
                className="w-full px-8 py-4 h-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl "
              >
                <Building className="mr-2 h-5 w-5" />
                View Business Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-sm text-gray-500">
                Check your verification status and manage your business information
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Documents under review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Profile access available</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
